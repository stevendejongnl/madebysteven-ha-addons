# HA passes BUILD_FROM (e.g. ghcr.io/home-assistant/amd64-base) but we ignore it:
# we wrap the upstream image directly so we get the same Python + Playwright + Chromium
# runtime that dwmp ships with. Trade-off: addon is amd64-only (matches upstream).
# 1.16.0+ honors X-Ingress-Path so HA's sidebar / ingress redirects work correctly.
ARG BUILD_FROM
FROM ghcr.io/stevendejongnl/dude-wheres-my-package:1.40.0

# Surface the HA base image in metadata even though we don't FROM it.
ARG BUILD_FROM
LABEL io.hass.build_from="${BUILD_FROM}"

COPY run.sh /run.sh
RUN chmod +x /run.sh

ENTRYPOINT ["/run.sh"]
