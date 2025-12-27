import { Query } from '~/application/cqrs/IQuery';
import type { HaikuValue, HaikuVariables } from '~/shared/types';

export class GenerateHaikuQuery extends Query<HaikuValue> {
  public readonly useAI: boolean;
  public readonly useCache: boolean;
  public readonly appendImg: boolean;
  public readonly selectionCount: number;
  public readonly theme: string;
  public readonly filter: string;
  public readonly sentimentMinScore: number;
  public readonly markovMinScore: number;
  public readonly posMinScore: number;
  public readonly trigramMinScore: number;
  public readonly tfidfMinScore: number;
  public readonly phoneticsMinScore: number;
  public readonly descriptionTemperature: number;

  constructor(variables: HaikuVariables) {
    super();
    this.useAI = variables.useAI;
    this.useCache = variables.useCache;
    this.appendImg = variables.appendImg;
    this.selectionCount = variables.selectionCount;
    this.theme = variables.theme;
    this.filter = variables.filter;
    this.sentimentMinScore = variables.sentimentMinScore;
    this.markovMinScore = variables.markovMinScore;
    this.posMinScore = variables.posMinScore;
    this.trigramMinScore = variables.trigramMinScore;
    this.tfidfMinScore = variables.tfidfMinScore;
    this.phoneticsMinScore = variables.phoneticsMinScore;
    this.descriptionTemperature = variables.descriptionTemperature;
  }

  toVariables(): HaikuVariables {
    return {
      useAI: this.useAI,
      useCache: this.useCache,
      appendImg: this.appendImg,
      selectionCount: this.selectionCount,
      theme: this.theme,
      filter: this.filter,
      sentimentMinScore: this.sentimentMinScore,
      markovMinScore: this.markovMinScore,
      posMinScore: this.posMinScore,
      trigramMinScore: this.trigramMinScore,
      tfidfMinScore: this.tfidfMinScore,
      phoneticsMinScore: this.phoneticsMinScore,
      descriptionTemperature: this.descriptionTemperature,
    };
  }
}
