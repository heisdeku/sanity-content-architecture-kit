import {
  type DocumentActionComponent,
  definePlugin,
  type Template,
} from "sanity";
import {
  NON_CREATABLE_TYPES,
  SINGLETON_IDS,
  SINGLETON_TYPES,
} from "../config/constants";

const SINGLETON_SET = new Set<string>(SINGLETON_TYPES);
const NON_CREATABLE_SET = new Set<string>(NON_CREATABLE_TYPES);

/** Actions that make no sense on a document that must exist exactly once. */
const LOCKED_ACTIONS = new Set(["create", "duplicate", "delete", "unpublish"]);

/** Removes the templates of singleton (and generated) types from the "new document" menu. */
export function filterSingletonTemplates(templates: Template[]): Template[] {
  return templates.filter(
    (template) => !NON_CREATABLE_SET.has(template.schemaType),
  );
}

/** Strips create/duplicate/delete/unpublish from singleton documents. */
export function singletonDocumentActions(
  actions: DocumentActionComponent[],
  context: { schemaType: string },
): DocumentActionComponent[] {
  if (!SINGLETON_SET.has(context.schemaType)) return actions;
  return actions.filter(
    (action) => !action.action || !LOCKED_ACTIONS.has(action.action),
  );
}

/** Fixed document id for a singleton type. */
export function getSingletonId(type: (typeof SINGLETON_TYPES)[number]): string {
  return SINGLETON_IDS[type];
}

export function isSingletonType(type: string): boolean {
  return SINGLETON_SET.has(type);
}

/**
 * Locks singletons: hides them from the "new document" menu, removes the
 * actions that would create a second copy or delete the only one, and
 * pins their ids (`homepage`, `site`) through the desk structure.
 */
export const singletonPlugin = definePlugin({
  name: "singleton-plugin",
  document: {
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type === "global") {
        return prev.filter((item) => !NON_CREATABLE_SET.has(item.templateId));
      }
      return prev;
    },
    actions: (prev, context) => singletonDocumentActions(prev, context),
  },
  schema: {
    templates: (prev) => filterSingletonTemplates(prev),
  },
});
