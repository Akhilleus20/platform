import { RequestHandler } from 'express-serve-static-core';
import * as Sentry from '@sentry/node';
import * as SecretariumInstruments from '@secretarium/instrumentation';
import { client as prismaClient } from '../../utils/db';
import { logger, scp as scpClient, scpOps } from '@klave/providers';

let sentryRequestMiddlewareReference: RequestHandler;
let sentryTracingMiddlewareReference: RequestHandler;
let sentryErrorMiddlewareReference: RequestHandler;

const initializeSentry = () => {
    logger.info('Initializing Sentry');
    Sentry.init({
        dsn: process.env.KLAVE_SENTRY_DSN,
        release: `klave@${process.env.GIT_REPO_VERSION}`,
        environment: process.env.KLAVE_SENTRY_ENV ?? process.env.NODE_ENV ?? 'development',
        integrations: [
            // enable HTTP calls tracing
            new Sentry.Integrations.Http({ tracing: true }),
            // enable Express.js middleware tracing
            new Sentry.Integrations.Express(),
            new Sentry.Integrations.Prisma({
                client: prismaClient
            }),
            new Sentry.Integrations.Mongo(),
            new SecretariumInstruments.Sentry.ConnectorTracing({
                connector: scpClient,
                domains: ['.sta.klave.network']
            })
        ],
        // Set tracesSampleRate to 1.0 to capture 100%
        // of transactions for performance monitoring.
        // We recommend adjusting this value in production
        tracesSampleRate: 1.0,
        beforeSend: (event) => {
            const secretariumVersion = scpOps.version();
            if (!event.tags)
                event.tags = {};
            event.tags['secretarium.core'] = secretariumVersion.core;
            event.tags['secretarium.wasm'] = secretariumVersion.wasm;
            return event;
        }
    });

    const fork = <Handler>(func: () => Handler) => {
        if (process.env.NODE_ENV === 'test')
            return () => {
                //
            };
        return func() as RequestHandler;
    };

    sentryRequestMiddlewareReference = fork(Sentry.Handlers.requestHandler);
    sentryTracingMiddlewareReference = fork(Sentry.Handlers.tracingHandler);
    sentryErrorMiddlewareReference = fork(Sentry.Handlers.errorHandler);
};

export const sentryRequestMiddleware: RequestHandler = (req, res, next) => {

    if (!sentryRequestMiddlewareReference)
        initializeSentry();
    return sentryRequestMiddlewareReference(req, res, next);
};

export const sentryTracingMiddleware: RequestHandler = (req, res, next) => {

    if (!sentryTracingMiddlewareReference)
        initializeSentry();
    return sentryTracingMiddlewareReference(req, res, next);
};

export const sentryErrorMiddleware: RequestHandler = (req, res, next) => {

    if (!sentryErrorMiddlewareReference)
        initializeSentry();
    return sentryErrorMiddlewareReference(req, res, next);
};