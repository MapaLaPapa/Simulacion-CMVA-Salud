FROM ubuntu:22.04

LABEL maintainer="Juan"
LABEL description="Telefonía Asterisk"

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y asterisk asterisk-modules curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY pjsip.conf /etc/asterisk/pjsip.conf
COPY extensions.conf /etc/asterisk/extensions.conf
COPY rtp.conf /etc/asterisk/rtp.conf

COPY sounds/ /usr/share/asterisk/sounds/es/

RUN chown -R asterisk:asterisk /etc/asterisk /var/lib/asterisk /var/log/asterisk /var/run/asterisk /var/spool/asterisk /usr/share/asterisk/sounds

EXPOSE 5060/udp 5060/tcp 10000-10099/udp

USER asterisk

CMD ["/usr/sbin/asterisk", "-f", "-vvvddd"]