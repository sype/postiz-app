import 'reflect-metadata';
import { TiktokProvider } from './tiktok.provider';

describe('TiktokProvider creatorInfo', () => {
  const provider = new TiktokProvider();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('exposes the creator-info method as a public integration tool', () => {
    const tools = Reflect.getMetadata(
      'custom:tool',
      TiktokProvider.prototype
    ) as Array<{ methodName: string }>;

    expect(tools).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ methodName: 'creatorInfo' }),
      ])
    );
  });

  it('returns only the sanitized creator identity and capabilities', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      status: 200,
      json: async () => ({
        data: {
          creator_avatar_url: 'https://example.test/avatar.jpg',
          creator_nickname: 'Plumeza Demo',
          creator_username: 'plumeza_demo',
          privacy_level_options: ['SELF_ONLY', 'PUBLIC_TO_EVERYONE'],
          comment_disabled: false,
          duet_disabled: true,
          stitch_disabled: false,
          max_video_post_duration_sec: 180,
          access_token: 'must-not-leak',
        },
      }),
    } as Response);

    await expect(provider.creatorInfo('secret-token')).resolves.toEqual({
      creatorAvatarUrl: 'https://example.test/avatar.jpg',
      creatorNickname: 'Plumeza Demo',
      creatorUsername: 'plumeza_demo',
      privacyLevelOptions: ['SELF_ONLY', 'PUBLIC_TO_EVERYONE'],
      commentDisabled: false,
      duetDisabled: true,
      stitchDisabled: false,
      maxVideoPostDurationSeconds: 180,
    });
  });

  it('fails closed when optional capability flags are absent', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      status: 200,
      json: async () => ({ data: {} }),
    } as Response);

    await expect(provider.creatorInfo('secret-token')).resolves.toEqual({
      creatorAvatarUrl: '',
      creatorNickname: '',
      creatorUsername: '',
      privacyLevelOptions: [],
      commentDisabled: true,
      duetDisabled: true,
      stitchDisabled: true,
      maxVideoPostDurationSeconds: 0,
    });
  });

  it('raises a refresh-token error when TikTok reports an invalid access token', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      status: 200,
      json: async () => ({
        data: {},
        error: { code: 'access_token_invalid', message: 'expired' },
      }),
    } as Response);

    await expect(provider.creatorInfo('expired-token')).rejects.toMatchObject({
      type: 'refresh_token',
    });
  });
});
