# HA passes BUILD_FROM (e.g. ghcr.io/home-assistant/amd64-base) but we ignore it:
# we wrap the upstream image directly so we get the same Python + Playwright + Chromium
# runtime that dwmp ships with. Trade-off: addon is amd64-only (matches upstream).
# Bump to 1.16.0 once upstream ships X-Ingress-Path support; until then the addon
# only works at the direct port, not behind HA ingress.
ARG BUILD_FROM
FROM ghcr.io/stevendejongnl/dude-wheres-my-package:1.15.2

# Surface the HA base image in metadata even though we don't FROM it.
ARG BUILD_FROM
LABEL io.hass.build_from="${BUILD_FROM}"

COPY run.sh /run.sh
RUN chmod +x /run.sh

ENTRYPOINT ["/run.sh"]
