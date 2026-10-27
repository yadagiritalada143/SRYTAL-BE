"use strict";
/**
 * Response shapes for the employee-facing ("my courses") endpoints. These are
 * plain view models assembled in the services — they are deliberately not the
 * raw mongoose documents, so the employee never receives S3 object keys or
 * other authoring-only fields.
 */
Object.defineProperty(exports, "__esModule", { value: true });
