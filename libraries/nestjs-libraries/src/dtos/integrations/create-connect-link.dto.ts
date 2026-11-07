import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateConnectLinkDto {
  @IsString()
  @IsOptional()
  provider?: string;

  @IsNumber()
  @IsOptional()
  expiresInHours?: number;

  /**
   * Page providers (Facebook, Instagram, LinkedIn page, YouTube): after the
   * consent, send the browser back to the link's return URL with
   * status=select_page&integration=<pending id> instead of showing this
   * instance's page picker. The caller lists and picks the page with its
   * org key (GET /integrations/:id/pages, POST /integrations/:id/page).
   * Needs a return URL (redirectUrl on the connect step).
   */
  @IsBoolean()
  @IsOptional()
  pickInApp?: boolean;
}
