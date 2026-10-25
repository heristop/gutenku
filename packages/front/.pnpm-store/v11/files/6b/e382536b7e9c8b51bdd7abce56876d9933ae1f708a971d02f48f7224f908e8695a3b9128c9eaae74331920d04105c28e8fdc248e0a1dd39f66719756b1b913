import { EmojiComponentType } from "../data.js";
import { CombinedEmojiTestDataItem, SimilarEmojiTestData } from "./similar.js";
/**
 * List of components
 */
type ComponentsCount = Required<Record<EmojiComponentType, number>>;
/**
 * Extended tree item
 */
interface TreeSplitEmojiTestDataItem extends CombinedEmojiTestDataItem {
  components: ComponentsCount;
  componentsKey: string;
}
/**
 * Tree item
 */
export interface EmojiComponentsTreeItem {
  item: TreeSplitEmojiTestDataItem;
  children?: Record<EmojiComponentType, EmojiComponentsTreeItem>;
}
export type EmojiComponentsTree = Record<string, EmojiComponentsTreeItem>;
/**
 * Convert test data to dependencies tree, based on components
 */
export declare function getEmojiTestDataTree(data: SimilarEmojiTestData): EmojiComponentsTree;