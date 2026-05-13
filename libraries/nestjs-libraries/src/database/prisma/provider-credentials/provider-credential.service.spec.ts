import { ProviderCredentialService } from './provider-credential.service';
import { ProviderCredentialRepository } from './provider-credential.repository';

describe('ProviderCredentialService', () => {
  let service: ProviderCredentialService;
  let repository: jest.Mocked<ProviderCredentialRepository>;

  beforeEach(() => {
    repository = {
      getByOrgAndProvider: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
      listByOrg: jest.fn(),
    } as any;

    service = new ProviderCredentialService(repository);
  });

  describe('getByOrgAndProvider', () => {
    it('should return null when no credentials exist', async () => {
      repository.getByOrgAndProvider.mockResolvedValue(null);

      const result = await service.getByOrgAndProvider('org-1', 'linkedin');

      expect(result).toBeNull();
      expect(repository.getByOrgAndProvider).toHaveBeenCalledWith(
        'org-1',
        'linkedin'
      );
    });

    it('should return decrypted credentials when they exist', async () => {
      repository.getByOrgAndProvider.mockResolvedValue({
        clientId: 'my-client-id',
        clientSecret: 'my-client-secret',
      });

      const result = await service.getByOrgAndProvider('org-1', 'linkedin');

      expect(result).toEqual({
        clientId: 'my-client-id',
        clientSecret: 'my-client-secret',
      });
    });
  });

  describe('upsert', () => {
    it('should call repository upsert with correct args', async () => {
      repository.upsert.mockResolvedValue({} as any);

      await service.upsert('org-1', 'linkedin', 'cid', 'csecret');

      expect(repository.upsert).toHaveBeenCalledWith(
        'org-1',
        'linkedin',
        'cid',
        'csecret'
      );
    });
  });

  describe('delete', () => {
    it('should call repository delete', async () => {
      repository.delete.mockResolvedValue({} as any);

      await service.delete('org-1', 'linkedin');

      expect(repository.delete).toHaveBeenCalledWith('org-1', 'linkedin');
    });
  });

  describe('listByOrg', () => {
    it('should return provider names without secrets', async () => {
      const mockList = [
        {
          provider: 'linkedin',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { provider: 'x', createdAt: new Date(), updatedAt: new Date() },
      ];
      repository.listByOrg.mockResolvedValue(mockList);

      const result = await service.listByOrg('org-1');

      expect(result).toEqual(mockList);
      expect(result.every((r: any) => !r.clientId && !r.clientSecret)).toBe(
        true
      );
    });
  });
});
