import { IsNumber, IsOptional } from 'class-validator';

export class CreateConnectLinkDto {
  @IsNumber()
  @IsOptional()
  expiresInHours?: number;
}
