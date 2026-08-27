# Postiz on Barbados

Postiz has already been migrated from the legacy LXC container to the Barbados
k3s cluster.

Current validation notes:

- legacy LXC `postiz-app` image: `ghcr.io/sype/postiz-app:v1.0.0-mt12`
- Barbados `internal-postiz/postiz` image before alignment: `ghcr.io/sype/postiz-app:v1.0.0-mt11`
- Barbados database contains production data:
  - `User`: 13
  - `Organization`: 13
  - `Post`: 19
  - `Integration`: 20

Use `postiz-image-mt13-patch.yaml` to deploy the YouTube connect-link redirect
fix on Barbados.

```bash
kubectl -n internal-postiz patch deployment postiz \
  --type merge \
  --patch-file deploy/k8s-barbados/postiz-image-mt13-patch.yaml

kubectl -n internal-postiz rollout status deployment/postiz
kubectl -n internal-postiz get deploy postiz -o jsonpath='{.spec.template.spec.containers[0].image}{"\n"}'
```
