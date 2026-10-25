import { BaseEmojiTestDataItem, EmojiTestData, EmojiTestDataItem } from "./parse.js";
import { EmojiSequenceWithComponents, EmojiTestDataComponentsMap } from "./components.js";
import { SplitEmojiName } from "./name.js";
/**
 * Similar test data items as one item
 */
export interface CombinedEmojiTestDataItem extends BaseEmojiTestDataItem {
  name: SplitEmojiName;
  sequenceKey: string;
  sequence: EmojiSequenceWithComponents;
}
export type SimilarEmojiTestData = Record<string, CombinedEmojiTestDataItem>;
/**
 * Find components in item, generate CombinedEmojiTestDataItem
 */
export declare function findComponentsInEmojiTestItem(item: EmojiTestDataItem, componentsData: EmojiTestDataComponentsMap): CombinedEmojiTestDataItem;
/**
 * Combine similar items in one iteratable item
 */
export declare function combineSimilarEmojiTestData(data: EmojiTestData, componentsData?: EmojiTestDataComponentsMap): SimilarEmojiTestData;