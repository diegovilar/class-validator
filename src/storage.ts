import { MetadataStorage } from "./metadata/MetadataStorage";
import { getFromContainer } from "./container";

export * from "./metadata/MetadataStorage";

/**
 * Default metadata storage is used as singleton and can be used to storage all metadatas.
 */
export function getMetadataStorage() {

    return getFromContainer(MetadataStorage.uniqueKey, MetadataStorage);

}
