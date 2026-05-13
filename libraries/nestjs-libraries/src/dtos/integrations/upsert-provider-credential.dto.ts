import { IsDefined, IsString } from 'class-validator';

export class UpsertProviderCredentialDto {
  @IsString()
  @IsDefined()
  clientId: string;

  @IsString()
  @IsDefined()
  clientSecret: string;
}
