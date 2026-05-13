import { IsDefined, IsNumber, IsOptional, IsString } from 'class-validator';

export class InjectTokenDto {
  @IsString()
  @IsDefined()
  provider: string;

  @IsString()
  @IsDefined()
  accessToken: string;

  @IsString()
  @IsOptional()
  refreshToken?: string;

  @IsNumber()
  @IsOptional()
  expiresIn?: number;

  @IsString()
  @IsDefined()
  internalId: string;

  @IsString()
  @IsDefined()
  name: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  picture?: string;
}
