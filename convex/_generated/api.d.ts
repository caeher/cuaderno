/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as aiMetrics from "../aiMetrics.js";
import type * as aiNode from "../aiNode.js";
import type * as categories from "../categories.js";
import type * as comments from "../comments.js";
import type * as composer from "../composer.js";
import type * as lib_ai_client from "../lib/ai/client.js";
import type * as lib_ai_config from "../lib/ai/config.js";
import type * as lib_ai_errors from "../lib/ai/errors.js";
import type * as lib_ai_imagePrompts from "../lib/ai/imagePrompts.js";
import type * as lib_ai_moderation from "../lib/ai/moderation.js";
import type * as lib_ai_openaiClient from "../lib/ai/openaiClient.js";
import type * as lib_ai_researchBudget from "../lib/ai/researchBudget.js";
import type * as lib_ai_researchPrompts from "../lib/ai/researchPrompts.js";
import type * as lib_ai_usage from "../lib/ai/usage.js";
import type * as lib_ai_writingPrompts from "../lib/ai/writingPrompts.js";
import type * as lib_ai_writingValidation from "../lib/ai/writingValidation.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_composerState from "../lib/composerState.js";
import type * as lib_helpers from "../lib/helpers.js";
import type * as migration from "../migration.js";
import type * as narrations from "../narrations.js";
import type * as posts from "../posts.js";
import type * as tags from "../tags.js";
import type * as templates from "../templates.js";
import type * as testAuth from "../testAuth.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  aiMetrics: typeof aiMetrics;
  aiNode: typeof aiNode;
  categories: typeof categories;
  comments: typeof comments;
  composer: typeof composer;
  "lib/ai/client": typeof lib_ai_client;
  "lib/ai/config": typeof lib_ai_config;
  "lib/ai/errors": typeof lib_ai_errors;
  "lib/ai/imagePrompts": typeof lib_ai_imagePrompts;
  "lib/ai/moderation": typeof lib_ai_moderation;
  "lib/ai/openaiClient": typeof lib_ai_openaiClient;
  "lib/ai/researchBudget": typeof lib_ai_researchBudget;
  "lib/ai/researchPrompts": typeof lib_ai_researchPrompts;
  "lib/ai/usage": typeof lib_ai_usage;
  "lib/ai/writingPrompts": typeof lib_ai_writingPrompts;
  "lib/ai/writingValidation": typeof lib_ai_writingValidation;
  "lib/auth": typeof lib_auth;
  "lib/composerState": typeof lib_composerState;
  "lib/helpers": typeof lib_helpers;
  migration: typeof migration;
  narrations: typeof narrations;
  posts: typeof posts;
  tags: typeof tags;
  templates: typeof templates;
  testAuth: typeof testAuth;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
