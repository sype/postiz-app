# Postiz on Barbados

Postiz has already been migrated from the legacy LXC container to the Barbados
k3s cluster.

Current deployment notes:

- previous Barbados image: `ghcr.io/sype/postiz-app:v1.0.0-mt12`
- target image: `ghcr.io/sype/postiz-app:v1.0.0-mt14`
- `v1.0.0-mt14` adds the sanitized TikTok `creatorInfo` integration tool
- Barbados database contains production data:
  - `User`: 13
  - `Organization`: 13
  - `Post`: 19
  - `Integration`: 20

Use `postiz-image-mt14-patch.yaml` to deploy the pinned image.

```bash
kubectl -n internal-postiz patch deployment postiz \
  --type merge \
  --patch-file deploy/k8s-barbados/postiz-image-mt14-patch.yaml

kubectl -n internal-postiz rollout status deployment/postiz
kubectl -n internal-postiz get deploy postiz -o jsonpath='{.spec.template.spec.containers[0].image}{"\n"}'
```
