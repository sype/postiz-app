import { Controller, Get, HttpException, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from '@gitroom/helpers/auth/auth.service';
import { ioRedis } from '@gitroom/nestjs-libraries/redis/redis.service';
import { IntegrationManager } from '@gitroom/nestjs-libraries/integrations/integration.manager';
import { OrganizationService } from '@gitroom/nestjs-libraries/database/prisma/organizations/organization.service';
import { ProviderCredentialService } from '@gitroom/nestjs-libraries/database/prisma/provider-credentials/provider-credential.service';
import dayjs from 'dayjs';

@ApiTags('Connect Links')
@Controller('/connect')
export class ConnectLinkController {
  constructor(
    private _integrationManager: IntegrationManager,
    private _organizationService: OrganizationService,
    private _providerCredentialService: ProviderCredentialService
  ) {}

  private validateToken(token: string): { orgId: string; linkId: string } {
    try {
      const payload = AuthService.verifyJWT(token) as {
        orgId: string;
        linkId: string;
        expiresAt: string;
      };

      if (!payload.orgId || !payload.expiresAt) {
        throw new HttpException({ msg: 'Invalid connect link' }, 400);
      }

      if (dayjs().isAfter(dayjs(payload.expiresAt))) {
        throw new HttpException({ msg: 'Connect link has expired' }, 410);
      }

      return payload;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new HttpException({ msg: 'Invalid connect link' }, 400);
    }
  }

  @Get('/:token/integrations')
  async getAvailableIntegrations(@Param('token') token: string) {
    const { orgId } = this.validateToken(token);

    const org = await this._organizationService.getOrgById(orgId);
    if (!org) {
      throw new HttpException({ msg: 'Organization not found' }, 404);
    }

    const integrations = await this._integrationManager.getAllIntegrations();

    return integrations.social
      .filter((i) => !i.isWeb3 && !i.isChromeExtension)
      .map((i) => ({
        name: i.name,
        identifier: i.identifier,
      }));
  }

  @Get('/:token/social/:integration')
  async getOAuthUrl(
    @Param('token') token: string,
    @Param('integration') integration: string
  ) {
    const { orgId } = this.validateToken(token);

    const org = await this._organizationService.getOrgById(orgId);
    if (!org) {
      throw new HttpException({ msg: 'Organization not found' }, 404);
    }

    if (
      !this._integrationManager
        .getAllowedSocialsIntegrations()
        .includes(integration)
    ) {
      throw new HttpException({ msg: 'Integration not allowed' }, 400);
    }

    const integrationProvider =
      this._integrationManager.getSocialIntegration(integration);

    if (integrationProvider.externalUrl) {
      throw new HttpException(
        { msg: 'This integration requires external configuration and is not supported via connect links' },
        400
      );
    }

    const orgCreds = await this._providerCredentialService.getByOrgAndProvider(
      orgId,
      integration
    );
    const clientInfo = orgCreds
      ? { client_id: orgCreds.clientId, client_secret: orgCreds.clientSecret, instanceUrl: '' }
      : undefined;

    const { codeVerifier, state, url } =
      await integrationProvider.generateAuthUrl(clientInfo);

    await ioRedis.set(`organization:${state}`, orgId, 'EX', 3600);
    await ioRedis.set(`login:${state}`, codeVerifier, 'EX', 3600);
    await ioRedis.set(
      `redirect:${state}`,
      `${process.env.FRONTEND_URL}/connect/${token}?success=${integration}`,
      'EX',
      3600
    );

    return { url };
  }
}
