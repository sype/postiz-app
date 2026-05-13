// Mock the integration manager to avoid pulling in all provider dependencies
jest.mock('./integration.manager', () => ({
  IntegrationManager: jest.fn(),
  socialIntegrationList: [],
}));

jest.mock('nestjs-temporal-core', () => ({
  TemporalService: jest.fn(),
}));

import { RefreshIntegrationService } from './refresh.integration.service';
import { Integration } from '@prisma/client';

describe('RefreshIntegrationService', () => {
  let service: RefreshIntegrationService;
  let integrationManager: any;
  let integrationService: any;
  let providerCredRepo: any;
  let temporalService: any;

  const mockIntegration = {
    id: 'int-1',
    organizationId: 'org-1',
    providerIdentifier: 'linkedin',
    refreshToken: 'refresh-token-123',
    internalId: 'internal-1',
    rootInternalId: 'internal-1',
    name: 'Test LinkedIn',
    picture: 'https://example.com/pic.jpg',
  } as Integration;

  const mockSocialProvider = {
    identifier: 'linkedin',
    oneTimeToken: false,
    refreshCron: true,
    reConnect: undefined as any,
    refreshToken: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    integrationManager = {
      getSocialIntegration: jest.fn().mockReturnValue(mockSocialProvider),
    };

    integrationService = {
      createOrUpdateIntegration: jest.fn().mockResolvedValue({}),
      refreshNeeded: jest.fn().mockResolvedValue(undefined),
      informAboutRefreshError: jest.fn().mockResolvedValue(undefined),
      disconnectChannel: jest.fn().mockResolvedValue(undefined),
    };

    providerCredRepo = {
      getByOrgAndProvider: jest.fn(),
    };

    temporalService = {
      client: { getRawClient: jest.fn() },
    };

    service = new RefreshIntegrationService(
      integrationManager,
      integrationService,
      temporalService,
      providerCredRepo
    );
  });

  describe('refresh', () => {
    it('should pass per-org credentials to refreshToken when they exist', async () => {
      const orgCreds = {
        clientId: 'org-client-id',
        clientSecret: 'org-client-secret',
      };
      providerCredRepo.getByOrgAndProvider.mockResolvedValue(orgCreds);
      mockSocialProvider.refreshToken.mockResolvedValue({
        accessToken: 'new-token',
        refreshToken: 'new-refresh',
        expiresIn: 3600,
        id: 'internal-1',
        name: 'Test',
        picture: '',
        username: 'test',
      });

      await service.refresh(mockIntegration);

      expect(providerCredRepo.getByOrgAndProvider).toHaveBeenCalledWith(
        'org-1',
        'linkedin'
      );
      expect(mockSocialProvider.refreshToken).toHaveBeenCalledWith(
        'refresh-token-123',
        orgCreds
      );
    });

    it('should pass undefined credentials when none exist (env var fallback)', async () => {
      providerCredRepo.getByOrgAndProvider.mockResolvedValue(null);
      mockSocialProvider.refreshToken.mockResolvedValue({
        accessToken: 'new-token',
        refreshToken: 'new-refresh',
        expiresIn: 3600,
        id: 'internal-1',
        name: 'Test',
        picture: '',
        username: 'test',
      });

      await service.refresh(mockIntegration);

      expect(mockSocialProvider.refreshToken).toHaveBeenCalledWith(
        'refresh-token-123',
        undefined
      );
    });

    it('should mark integration as refreshNeeded on failure', async () => {
      providerCredRepo.getByOrgAndProvider.mockResolvedValue(null);
      mockSocialProvider.refreshToken.mockRejectedValue(
        new Error('Token expired')
      );

      const result = await service.refresh(mockIntegration);

      expect(result).toBe(false);
      expect(integrationService.refreshNeeded).toHaveBeenCalledWith(
        'org-1',
        'int-1'
      );
    });

    it('should update integration with new tokens on success', async () => {
      providerCredRepo.getByOrgAndProvider.mockResolvedValue(null);
      mockSocialProvider.refreshToken.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 7200,
        id: 'internal-1',
        name: 'Test',
        picture: '',
        username: 'test',
      });

      const result = await service.refresh(mockIntegration);

      expect(result).toEqual(
        expect.objectContaining({ accessToken: 'new-access-token' })
      );
      expect(integrationService.createOrUpdateIntegration).toHaveBeenCalledWith(
        undefined,
        false,
        'org-1',
        'Test LinkedIn',
        'https://example.com/pic.jpg',
        'social',
        'internal-1',
        'linkedin',
        'new-access-token',
        'new-refresh-token',
        7200
      );
    });
  });
});
