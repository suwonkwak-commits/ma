import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? '무림여록',
  slug: config.slug ?? 'murim-chronicles',
  experiments: {
    ...config.experiments,
    // GitHub project Pages lives under /ma; ordinary development stays at /.
    baseUrl: process.env.WEB_BASE_PATH ?? '',
  },
});
