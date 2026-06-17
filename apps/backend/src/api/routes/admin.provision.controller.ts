import {
  Body,
  Controller,
  Headers,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import {
  IsDefined,
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Provider } from '@prisma/client';
import { OrganizationService } from '@gitroom/nestjs-libraries/database/prisma/organizations/organization.service';
import { UsersService } from '@gitroom/nestjs-libraries/database/prisma/users/users.service';
import { makeId } from '@gitroom/nestjs-libraries/services/make.is';

class ProvisionOrgDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  @IsDefined()
  name: string;

  @IsEmail()
  @IsDefined()
  email: string;
}

/**
 * Admin provisioning endpoint (no org-API-key auth — gated by POSTIZ_ADMIN_TOKEN).
 *
 * Used by the Cloudeefly "Social Media (agences)" service to create one Postiz
 * Organization per client on the shared instance, over HTTPS (the Postiz DB is
 * not reachable from the K8s-deployed Cloudeefly). Public registration is
 * disabled, so this is the supported way to create orgs programmatically.
 *
 *   POST /provisioning/organizations
 *   header: x-admin-token: <POSTIZ_ADMIN_TOKEN>
 *   body:   { name, email }
 *   -> { organizationId, userId, email, password, apiKey }
 */
@Controller('/provisioning')
export class AdminProvisionController {
  constructor(
    private _organizationService: OrganizationService,
    private _usersService: UsersService
  ) {}

  @Post('/organizations')
  async createOrganization(
    @Headers('x-admin-token') adminToken: string,
    @Body() body: ProvisionOrgDto
  ) {
    const expected = process.env.POSTIZ_ADMIN_TOKEN;
    if (!expected || !adminToken || adminToken !== expected) {
      throw new UnauthorizedException('Invalid admin token');
    }

    const password = makeId(14);
    const org = await this._organizationService.createOrgAndUser(
      {
        company: body.name,
        email: body.email,
        password,
        provider: Provider.LOCAL,
        datafast_visitor_id: '',
      },
      '',
      'cloudeefly-provisioning'
    );

    // createOrgAndUser laisse le user non activé (LOCAL + SMTP) → activation
    // immédiate pour permettre le login sans email de confirmation.
    const userId = org?.users?.[0]?.user?.id;
    if (userId) {
      await this._usersService.activateUser(userId);
    }

    // L'apiKey stockée est la clé utilisable telle quelle par l'API publique.
    const full = await this._organizationService.getOrgById(org.id);

    return {
      organizationId: org.id,
      userId,
      email: body.email,
      password, // mot de passe temporaire — renvoyé une seule fois
      apiKey: full?.apiKey,
    };
  }
}
