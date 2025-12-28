/* eslint-disable max-lines -- Data file containing curated book list */
/**
 * OBFUSCATED book data for GutenGuess game.
 * DO NOT EDIT DIRECTLY - regenerate from gutenguess-books-source.ts
 *
 * To update books:
 * 1. Edit gutenguess-books-source.ts (gitignored)
 * 2. Run: pnpm obfuscate:books
 */
import { deobfuscate } from '../utils/obfuscate';

export interface GutenGuessBook {
  id: number;
  title: string;
  author: string;
  genre: string;
  era: string;
  authorNationality: string;
  emoticons: string;
  notableQuotes: string[];
}

interface EncodedGutenGuessBook {
  id: number;
  title: string;
  author: string;
  genre: string;
  era: string;
  authorNationality: string;
  emoticons: string;
  notableQuotes: string[];
}

const GUTENGUESS_BOOKS_ENCODED: readonly EncodedGutenGuessBook[] = [
  {
    id: 11,
    title: 'JhkdBgtMBg0xEQwfAhFYGQAKRxwaRTkEG0kVBxYbAgE=',
    author: 'KxADDB1LNkwCBxUWAA==',
    genre: 'Fantasy',
    era: 'Victorian',
    authorNationality: 'British',
    emoticons: '🐰🎩🍄🃏👸',
    notableQuotes: [
      'MBBTFwtLFEEcVRcbCEVFDhccSQ==',
      'JAAGDAEeBkgCVRsUCEVOHhcQCAAHABxK',
      'KBMSRRkCAUVQHR8ITA1ICgFY',
    ],
  },
  {
    id: 16,
    title: 'NxAAABxLJUwe',
    author: 'LVs5S04pFF8CHB8=',
    genre: 'Fantasy',
    era: 'Edwardian',
    authorNationality: 'Scottish',
    emoticons: '🧚✨🏴‍☠️🐊⭐',
    notableQuotes: [
      'MxpUAQcOVVoZGRZaDgANCgtZBgISEAIHDA0SHB1aDQFbDgsNEgcRSw==',
      'JhkYRQ0DHEEUBx8UQEVIEwYcFwFUCgAOWQ0XBxUNTBBdRQ==',
    ],
  },
  {
    id: 36,
    title: 'Mx0RRTkKBw0fE1oOBAANPAoLCxEH',
    author: 'L1szS048EEEcBg==',
    genre: 'Science Fiction',
    era: 'Victorian',
    authorNationality: 'British',
    emoticons: '👽🔴🌍💥🛸',
    notableQuotes: [
      'KRpUCgAOVVofABYeTA1MHQBZBRAYDAsdEElQHBRaGA1ISwkYFAFUHAsKB15QGhxaGA1ISwsQCRAAAAsFAUVQFh8UGBBfEktXSQ==',
      'Mx0RRQ0DFEMTEAlaAwMNCgsAEx0dCwlLFkIdHBQdTANfBAhZKhQGFk4KB0hQFFoXBQlBAgoXRwEbRQEFEAM=',
    ],
  },
  {
    id: 45,
    title: 'JhsaAE4EEw03Bx8fAkVqCgcVAgY=',
    author: 'K1s5S04mGkMEEhUXCRdU',
    genre: 'Coming-of-Age',
    era: 'Edwardian',
    authorNationality: 'Canadian',
    emoticons: '👧🏠🌸📚💚',
    notableQuotes: [
      'LlIZRR0EVUocFB5aJUVBAhMcRxwaRQ9LAkICGR5aGw1IGQBZEx0RFwtLFF8VVTUZGApPDhcKSQ==',
      'MxoZChwZGlpQHAlaDQlaChwKRxMGAB0DVVoZARJaAgoNBgwKExQfAB1LHENQHA5U',
    ],
  },
  {
    id: 55,
    title: 'Mx0RRTkEG0kVBxwPAEV6Ah8YFRFUCghLOlc=',
    author: 'K1tUIxwKG0ZQNxsPAQ==',
    genre: 'Fantasy',
    era: 'Early 20th Century',
    authorNationality: 'American',
    emoticons: '🌪️👠🦁🤖🧙',
    notableQuotes: [
      'Mx0RFwtMBg0eGloKAARODkUVDh4RRQYEGEhe',
      'MxoACkJLPAoGEFobTANIDgkQCRJUEgtMB0hQGxUOTAxDSy4YCQYVFk4KG1QdGggfQg==',
    ],
  },
  {
    id: 74,
    title: 'Mx0RRS8PA0geAQ8ICRYNBANZMxoZRT0KAlQVBw==',
    author: 'KhQGDk4/AkwZGw==',
    genre: 'Adventure',
    era: 'Gilded Age',
    authorNationality: 'American',
    emoticons: '👦🎣🏝️💀🖌️',
    notableQuotes: [
      'MBoGDk4IGkMDHAkOH0VCDUUODxQAABgOBw0RVRgVCBwNAhZZCBcYDAkOEQ0EGloeA0s=',
      'Mx0RRQIOBl5QARIfHgANAhZZExpUDxsYAUQWDFobTBFfCgEQExwbCw8HVU4FBg4VAUkNHw0cRx0VFwoOBw0ZAVoTH0VZBEUeAgFUFwcPVUIWVRMOQg==',
    ],
  },
  {
    id: 76,
    title: 'JhECAAAfAF8VBloVCkVlHgYSCxAWABwZDA02HBQU',
    author: 'KhQGDk4/AkwZGw==',
    genre: 'Adventure',
    era: 'Gilded Age',
    authorNationality: 'American',
    emoticons: '🛶🌊👦🏃💫',
    notableQuotes: [
      'JhkYRRwCEkUEWVoOBABDR0UwQBkYRQkEVVkfVRIfAAkD',
      'LwAZBABLF0gZGx0JTAZMBUUbAlUVEggeGQ0TBw8fAEVZBEUWCRBUBAAEAUUVB1Q=',
    ],
  },
  {
    id: 84,
    title: 'IQcVCwUOG14EEBMU',
    author: 'KhQGHE44HUgcGR8D',
    genre: 'Gothic Horror',
    era: 'Romantic',
    authorNationality: 'British',
    emoticons: '⚡🧟💀🏔️🔬',
    notableQuotes: [
      'JRADBBwOTg0WGghaJUVMBkUfAhQGCQsYBgFQFBQeTBFFDhccARoGAE4bGloVBxwPAEs=',
      'KRoADQcFEg0ZBloJA0VdCgwXAQAYRRoEVVkYEFoSGQhMBUUUDhsQRQ8YVUxQEggfDRENCgsdRwYBAQoOGw0THRsUCwAD',
    ],
  },
  {
    id: 120,
    title: 'MwcRBB0eB0hQPAkWDQtJ',
    author: 'NRoWABwfVWEfABMJTDZZDhMcCQYbCw==',
    genre: 'Adventure',
    era: 'Victorian',
    authorNationality: 'Scottish',
    emoticons: '🏴‍☠️💰🗺️🦜⚓',
    notableQuotes: [
      'IRwSEQsOGw0dEBRaAwsNHw0cRxERBApLGEweUglaDw1IGBFVRwwbSAYEWEUfWVobAgENCkUbCAEACQtLGktQBw8XTQ==',
      'Mx0RCE4fHUwEVR4TCUJBB0UbAlUADQtLGVgTHgNaAwtIGEs=',
    ],
  },
  {
    id: 158,
    title: 'IhgZBA==',
    author: 'LRQaAE4qAF4EEBQ=',
    genre: 'Romance',
    era: 'Regency',
    authorNationality: 'British',
    emoticons: '👩💕🏡🎭💐',
    notableQuotes: [
      'LlUVCRkKDF5QER8JCRdbDkUNDxBUBwsYAQ0EBx8bGAhIBRFZBRAXBBsYEA05VRQfGgBfSxUME1UBFU4cHFkYVRsUFUVCHw0cFVs=',
      'NBwYCRdLAUUZGx0JTAFCSwYcBgYRRRoEVU8VVQkTAAlUSwwfRwEcABdLFF8VVR4VAgANCRxZFBAaFgcJGUhQBR8VHAlIRQ==',
    ],
  },
  {
    id: 174,
    title: 'Mx0RRT4CFlkFBx9aAwMNLwoLDhQaRSkZFFQ=',
    author: 'KAYXBBxLIkQcER8=',
    genre: 'Gothic',
    era: 'Victorian',
    authorNationality: 'Irish',
    emoticons: '🖼️👤💀🌹✨',
    notableQuotes: [
      'Mx0RRQEFGVRQAhsDTBFCSwIcE1UGDApLGktQFFoOCQhdHwQNDhoaRQcYVVkfVQMTCQlJSxEWRxwASw==',
      'MxpUAQsNHEMVVRMJTBFCSwkQChwASw==',
    ],
  },
  {
    id: 244,
    title: 'JlUnERsPDA0ZG1opDwRfBwAN',
    author: 'JgcADRsZVW4fGxsUTCFCEgkc',
    genre: 'Mystery',
    era: 'Victorian',
    authorNationality: 'British',
    emoticons: '🔍🎩💉🔴🕵️',
    notableQuotes: [
      'Mx0RFwtLHF5QGxUOBAxDDEUXAgJUEAAPEF9QARIfTBZYBUs=',
      'MB0RC04SGlhQHRsMCUVIBwwUDhsVEQsPVVkYEFoTARVCGBYQBRkRSU4cHUwEEAwfHkVfDggYDhsHRQMeBllQFx9aGA1ISxELEgEcSw==',
    ],
  },
  {
    id: 345,
    title: 'IwcVBhsHFA==',
    author: 'JQcVCE44AUIbEAg=',
    genre: 'Gothic Horror',
    era: 'Victorian',
    authorNationality: 'Irish',
    emoticons: '🧛🏰🦇🌙💉',
    notableQuotes: [
      'KxwHEQsFVVkfVQ4SCQgBSxERAlUXDQcHEV8VG1oVCkVZAwBZCRwTDRpFVXoYFA5aARBeAgZZEx0RHE4GFEYVVA==',
      'LlUVCE4vB0wTABYbQEVMBQFZLlUWDApLDEIFVQ0fAAZCBgBX',
    ],
  },
  {
    id: 730,
    title: 'KBkdEwsZVXkHHAkO',
    author: 'JB0VFwIOBg00HBkRCQte',
    genre: 'Social Novel',
    era: 'Victorian',
    authorNationality: 'British',
    emoticons: '👦🍲🏭💔🎩',
    notableQuotes: [
      'NxkRBB0OWQ0DHAhWTCwNHAQXE1UHCgMOVUAfBx9U',
      'Mx0RFwtLHF5QBhUXCRFFAgseRxQWChsfVUxQBxUPHwBJSxIWChQaSw==',
    ],
  },
  {
    id: 768,
    title: 'MAAADQsZHEMXVTIfBQJFHxY=',
    author: 'IhgdCRdLN18fGw7CkQ==',
    genre: 'Gothic Romance',
    era: 'Victorian',
    authorNationality: 'British',
    emoticons: '🌪️💔🏚️👻❤️',
    notableQuotes: [
      'LxBTFk4GGl8VVRcDHwBBDUUNDxQaRSdLFEBe',
      'MB0VEQsdEF9QGg8ITBZCHgkKRxQGAE4GFEkVVRUcQEVFAhZZBhsQRQMCG0hQFAgfTBFFDkUKBhgRSw==',
    ],
  },
  {
    id: 863,
    title: 'Mx0RRSMSBlkVBxMVGRYNKgMfBhwGRQ8fVX4EDBYfHw==',
    author: 'JhIVEQYKVW4YBxMJGAxI',
    genre: 'Mystery',
    era: 'Interwar',
    authorNationality: 'British',
    emoticons: '☠️🔍💊🏠🧓',
    notableQuotes: [
      'IgMRFxdLGFgCER8ICRcNAhZZFwcbBw8JGVRQBhUXCQdCDxxeFFUbCQpLE18ZEBQeQg==',
      'Mx0RRR0CGF0cEAkOTABVGwkYCRQADAEFVUQDVRsWGwRUGEUNDxBUCAEYAQ0cHBEfABwD',
    ],
  },
  {
    id: 1184,
    title: 'Mx0RRS0EAEMEVRUcTChCBREcRzYGDB0fGg==',
    author: 'JhkRHQ8FEV8VVT4PAQRe',
    genre: 'Adventure',
    era: 'Romantic',
    authorNationality: 'French',
    emoticons: '⛓️💎🗡️🏝️💰',
    notableQuotes: [
      'JhkYRQYeGEweVQ0THwFCBkUQFFUHEAMGEElQAApaBQsNHxIWRwIbFwoYTw0HFBMOTARDD0URCAURSw==',
      'KxwSAE4CBg0RVQkOAxdARUU2CRBUAQ8SVVkYEFoJGQsNGA0QCRAHRQ8FEQ0EHR9aAgBVH0UdBgxUEQYeG0kVB1oIAwlBGEs=',
    ],
  },
  {
    id: 1232,
    title: 'Mx0RRT4ZHEMTEA==',
    author: 'KRwXBgEHwocNPRQZEgUEWw4JFQ4=',
    genre: 'Political Philosophy',
    era: 'Renaissance',
    authorNationality: 'Italian',
    emoticons: '👑🗡️🦊🦁📜',
    notableQuotes: [
      'LgFUDB1LF0gEAR8ITBFCSwccRxMRBBwOEQ0EHRsUTAlCHQAdSQ==',
      'Mx0RRQsFEV5QHw8JGAxLEkUNDxBUCAsKG15e',
    ],
  },
  {
    id: 1260,
    title: 'LRQaAE4uDF8V',
    author: 'JB0VFwIEAVkVVTgIAwtZwoA=',
    genre: 'Gothic Romance',
    era: 'Victorian',
    authorNationality: 'British',
    emoticons: '👩📚🏚️🔥❤️',
    notableQuotes: [
      'LlUVCE4FGg0SHAgeV0VMBQFZCRpUCwsfVUgeBhQbHgBeSwgcSQ==',
      'NRAVAQsZWQ05VRcbHhdEDgFZDxwZSw==',
    ],
  },
  {
    id: 1342,
    title: 'NwcdAQtLFEMUVSoICQ9YDwwaAg==',
    author: 'LRQaAE4qAF4EEBQ=',
    genre: 'Romance',
    era: 'Regency',
    authorNationality: 'British',
    emoticons: '💃🎩💕📝🏛️',
    notableQuotes: [
      'LgFUDB1LFA0EBw8OBEVYBQwPAgcHBAIHDA0RFhEUAxJBDgEeAhFaS0A=',
      'PhoBRQYKA0hQFx8NBRFOAwAdRxgRSU4JGkkJVRsUCEVeBBAVSQ==',
    ],
  },
  {
    id: 1399,
    title: 'JhsaBE4gFF8VGxMUDQ==',
    author: 'KxAbRToEGV4EGgM=',
    genre: 'Realist Novel',
    era: 'Victorian',
    authorNationality: 'Russian',
    emoticons: '🚂💔👩❄️💃',
    notableQuotes: [
      'JhkYRQYKBV0JVRwbAQxBAgAKRxQGAE4KGUQbEEFaCQROA0UMCR0VFR4SVUsRGBMWFUVEGEUMCR0VFR4SVUQeVRMOH0VCHAtZEBQNSw==',
      'LhNUHAEeVUEfGhFaCgpfSxUcFRMRBhoCGkNcVQMVGUJBB0UXAgMRF04JEA0TGhQOCQtZRQ==',
    ],
  },
  {
    id: 1400,
    title: 'IAcRBBpLMFUAEBkODRFEBAsK',
    author: 'JB0VFwIOBg00HBkRCQte',
    genre: 'Coming-of-Age',
    era: 'Victorian',
    authorNationality: 'British',
    emoticons: '👦💰👰🔨⛓️',
    notableQuotes: [
      'LlUYChgOEQ0YEAhaDQJMAgsKE1UGAA8YGkNcVRsdDQxDGBFZFwcbCAcYEAFQFB0bBQteH0UJAhQXAEA=',
      'NAASAwsZHEMXVRIbH0VPDgAXRwYAFwEFEkgCVQ4SDQsNCgkVRxoADQsZVVkVFBkSBQtKRQ==',
    ],
  },
  {
    id: 1661,
    title: 'Mx0RRS8PA0geAQ8ICRYNBANZNB0RFwIEFkZQPRUWAQBe',
    author: 'JgcADRsZVW4fGxsUTCFCEgkc',
    genre: 'Mystery',
    era: 'Victorian',
    authorNationality: 'British',
    emoticons: '🔍🎻🧪💨🎩',
    notableQuotes: [
      'IhkRCAsFAUwCDFZaARwNDwAYFVUjBBoYGkNe',
      'MB0RC04SGlhQHRsMCUVIBwwUDhsVEQsPVVkYEFoTARVCGBYQBRkRSU4cHUwEEAwfHkVfDggYDhsHRQMeBllQFx9aGA1ISxELEgEcSw==',
    ],
  },
  {
    id: 2600,
    title: 'MBQGRQ8FEQ0gEBsZCQ==',
    author: 'KxAbRToEGV4EGgM=',
    genre: 'Historical Fiction',
    era: 'Victorian',
    authorNationality: 'Russian',
    emoticons: '⚔️❄️👑💔🇷🇺',
    notableQuotes: [
      'Mx0RRR0fB0IeEh8JGEVCDUUYCxlUEg8ZB0QfBwlaDRdISxERAgYRRRocGg3igaRVLhMBAA0KCx1HJRURBw4bThVb',
      'MBBUBg8FVUYeGg1aAwtBEkUNDxQARRkOVUYeGg1aAgpZAwwXAFs=',
    ],
  },
  {
    id: 2701,
    title: 'KhoWHE4vHE4b',
    author: 'LxAGCA8FVWAVGQwTAAlI',
    genre: 'Adventure',
    era: 'American Renaissance',
    authorNationality: 'American',
    emoticons: '🐋🚢⚓🌊😠',
    notableQuotes: [
      'JBQYCU4GEA05BhIXDQBBRQ==',
      'LgFUDB1LG0IEVR4VGwsNBAtZBhsNRQMKBRZQAQgPCUVdBwQaAgZUCwsdEF9QFAgfQg==',
    ],
  },
  {
    id: 2852,
    title: 'Mx0RRSYEAEMUVRUcTBFFDkU7BgYfABwdHEEcEAk=',
    author: 'JgcADRsZVW4fGxsUTCFCEgkc',
    genre: 'Mystery',
    era: 'Edwardian',
    authorNationality: 'British',
    emoticons: '🐕🌫️🏚️🔍💀',
    notableQuotes: [
      'KgdaRSYEGUAVBlZaGA1IEkUOAgcRRRoDEA0WGhUOHBdEBREKRxoSRQ9LEkQXFBQOBQYNAwoMCRFV',
      'Mx0RRRkEB0EUVRMJTANYBwlZCBNUCgwdHEIFBloOBAxDDBZZEB0dBgZLG0ISGh4DTApPGAALERAHSw==',
    ],
  },
  {
    id: 8800,
    title: 'Mx0RRSoCA0QeEFo5AwhIDxw=',
    author: 'IxQaEQtLNEEZEhITCRdE',
    genre: 'Epic Poetry',
    era: 'Medieval',
    authorNationality: 'Italian',
    emoticons: '🔥👼😈⭐🚶',
    notableQuotes: [
      'JhcVCwoEGw0RGRZaBApdDklZHhBUEgYEVUgeAR8ITA1IGQBX',
      'Mx0RRR4KAUVQARVaHARfCgEQFBBUBwsMHEMDVRMUTA1IBwlX',
    ],
  },
  {
    id: 64317,
    title: 'Mx0RRSkZEEwEVT0bGBZPEg==',
    author: 'IVtUNg0EAVlQMxMOFgJIGQQVAw==',
    genre: 'Tragedy',
    era: 'Jazz Age',
    authorNationality: 'American',
    emoticons: '🎉💚🥂🚗💔',
    notableQuotes: [
      'NBpUEgtLF0gRAVoVAkkNCQoYEwZUBAkKHEMDAVoOBAANCBALFRAaEUA=',
      'JBQaQhpLB0gAEBsOTBFFDkUJBgYAWk48HVRQGhxaDwpYGRYcRwwbEE4IFENR',
    ],
  },
  {
    id: 28054,
    title: 'Mx0RRSwZGlkYEAgJTC5MGQQUBg8bEw==',
    author: 'IQwbAQEZVWkfBg4VCRNeABw=',
    genre: 'Philosophical Fiction',
    era: 'Victorian',
    authorNationality: 'Russian',
    emoticons: '👨‍👨‍👦💔⛪💰😈',
    notableQuotes: [
      'Mx0RRR0EAEFQHAlaBABMBwAdRxcNRQwOHEMXVQ0TGA0NCA0QCxEGAABF',
      'LhNUIgEPVUkfEAlaAgpZSwABDgYASU4OA0gCDA4SBQtKSwwKRwURFwMCAVkVEVQ=',
    ],
  },
  {
    id: 203,
    title: 'MhsXCQtLIUIdUglaLwRPAgs=',
    author: 'LxQGFwcOAQ0yEB8ZBABfSzYNCAIR',
    genre: 'Social Novel',
    era: 'Antebellum',
    authorNationality: 'American',
    emoticons: '⛓️🏠💔🙏✊',
    notableQuotes: [
      'Mx0RRQIEG0oVBg5aGwRUSwgMFAFUDQ8dEA0ZAQlaDwlCGABX',
      'LlUaABgOBw0EHRUPCw1ZSwgARx0RBBwfVU4fABYeTA1CBwFZFBpUCBsIHQM=',
    ],
  },
  {
    id: 105,
    title: 'NxAGFhsKBkQfGw==',
    author: 'LRQaAE4qAF4EEBQ=',
    genre: 'Romance',
    era: 'Regency',
    authorNationality: 'British',
    emoticons: '💌⚓💕🌊👩',
    notableQuotes: [
      'PhoBRR4CEF8TEFoXFUVeBBAVSVU9RQ8GVUURGRxaDQJCBRxVRx0VCQhLHUIAEFQ=',
      'Mx0RFwtLFkIFGR5aBARbDkUbAhAaRQAEVVkHGloSCQRfHxZZFBpUCh4OGwM=',
    ],
  },
  {
    id: 161,
    title: 'NBAaFgtLFEMUVSkfAhZECQwVDgEN',
    author: 'LRQaAE4qAF4EEBQ=',
    genre: 'Romance',
    era: 'Regency',
    authorNationality: 'British',
    emoticons: '👭💔💕🏡📝',
    notableQuotes: [
      'LBsbEk4SGlgCVRUNAkVFChUJDhsRFh1F',
      'Mx0RRQMEB0hQPFoRAgpaSwofRwEcAE4cGl8cEVZaGA1ISwgWFRBULE4KGA0TGhQMBQtODgFZLlUHDQ8HGQ0eEAwfHkVeDgBZBlUZBABLAkUfGFozTAZMBUULAhQYCRdLGUIGEFQ=',
    ],
  },
  {
    id: 766,
    title: 'IxQCDApLNkIABR8ICgxIBwE=',
    author: 'JB0VFwIOBg00HBkRCQte',
    genre: 'Bildungsroman',
    era: 'Victorian',
    authorNationality: 'British',
    emoticons: '👦📖✍️💔🎭',
    notableQuotes: [
      'MB0REQYOBw05VQkSDQlBSxEMFRtUChsfVVkfVRgfTBFFDkURAgcbRQENVUAJVRUNAkVBAgMcSVta',
      'JhYXDAoOG1kDVQ0TAAkNBAYaEgdUDABLAUUVVRgfHxEAGQAeEhkVEQsPVUsRGBMWBQBeRQ==',
    ],
  },
  {
    id: 145,
    title: 'KhwQAQIOGEwCFhI=',
    author: 'IBAbFwkOVWgcHBUO',
    genre: 'Realist Novel',
    era: 'Victorian',
    authorNationality: 'British',
    emoticons: '👩🔬💔🏘️📚',
    notableQuotes: [
      'LgFUDB1LG0gGEAhaGApCSwkYExBUEQFLF0hQAhIbGEVUBBBZChwTDRpLHUwGEFoYCQBDRQ==',
      'MB0VEU4PGg0HEFoWBRNISwMWFVlUDAhLG0IEVQ4VTAhMAABZCxwSAE4HEF4DVR4TCgNECBAVE1USChxLEEwTHVoVGA1IGVo=',
    ],
  },
  {
    id: 6130,
    title: 'Mx0RRScHHEwU',
    author: 'LxoZABw=',
    genre: 'Epic Poetry',
    era: 'Ancient',
    authorNationality: 'Greek',
    emoticons: '⚔️🏛️🐴👑😠',
    notableQuotes: [
      'NBwaAkJLOg0XGh4eCRZeR0UNDxBUBAAMEF9QGhxaLQZFAgkVAgZa',
      'Mx0RFwtLHF5QGxUOBAxDDEUYCxwCAE4GGl8VVRsdAwtEEQAdRwEcBABLGEweWw==',
    ],
  },
  {
    id: 996,
    title: 'IxoaRT8eHFUfAR8=',
    author: 'KhwTEAsHVUkVVTkfHhNMBREcFA==',
    genre: 'Satire',
    era: 'Spanish Golden Age',
    authorNationality: 'Spanish',
    emoticons: '🐴🏰🌾💫🛡️',
    notableQuotes: [
      'MxwYEQcFEg0RAVoNBQtJBgwVCwZa',
      'Mx0RRRoZAFkYVRcbFUVPDkUKEwcREQ0DEElQARITAkkNCRANRxwARQAOA0gCVRgICQRGGEs=',
    ],
  },
  {
    id: 1497,
    title: 'Mx0RRTwOBVgSGRMZ',
    author: 'NxkVEQE=',
    genre: 'Philosophy',
    era: 'Ancient',
    authorNationality: 'Greek',
    emoticons: '🏛️💭⚖️🔥👁️',
    notableQuotes: [
      'Mx0RRQMSAUVQGhxaGA1ISwYYERBa',
      'LQAHEQcIEA0ZG1oOBAANBwwfAlUVCwpLFkIeEQ8ZGEVCDUUNDxBUNhoKAUhQHAlaHApeGAwbCxBUCgAHDA0RBlocBRdeH0UQE1UGAB0CEUgDVRMUTBFFDkURAhQGER1LGktQARIfTAZEHwwDAhsHSw==',
    ],
  },
  {
    id: 69087,
    title: 'Mx0RRSMeB0kVB1oVCkV/BAIcFVU1BgUZGlQU',
    author: 'JhIVEQYKVW4YBxMJGAxI',
    genre: 'Mystery',
    era: 'Interwar',
    authorNationality: 'British',
    emoticons: '🔪🕵️📓🏠😱',
    notableQuotes: [
      'Mx0RRRoZAFkYWVoSAxJIHQALRwATCRdLHENQHA4JCQlLR0UQFFUVCRkKDF5QFg8IBQpYGEUYCRFUBwsKAFkZEw8WTBFCSxYcAh4RFx1LFEsEEAhaBRED',
      'MRAGHE4NEFpQGhxaGRYNChccRwIcBBpLAkhQBh8fAUs=',
    ],
  },
  {
    id: 21,
    title: 'JhAHCh5MBg02FBgWCRY=',
    author: 'JhAHCh4=',
    genre: 'Fables',
    era: 'Ancient',
    authorNationality: 'Greek',
    emoticons: '🦊🐢🦁🐜📖',
    notableQuotes: [
      'NBkbEk4KG0lQBg4fDQFUSxIQCQZUEQYOVV8RFh9U',
      'JlUWDBwPVUQeVQ4SCUVFCgsdRxwHRRkEB1kYVQ4NA0VEBUUNDxBUBxsYHQM=',
    ],
  },
  {
    id: 1998,
    title: 'Mx0BFk44BUIbEFogDRdMHw0MFAEGBA==',
    author: 'IQcdAAoZHE4YVTQTCRFXGAYRAg==',
    genre: 'Philosophy',
    era: 'Victorian',
    authorNationality: 'German',
    emoticons: '🏔️🦅💫🔥🧙',
    notableQuotes: [
      'IBoQRQcYVUkVFB5U',
      'MB0VEU4PGkgDVRQVGEVGAgkVRxgRRQMKHkgDVRcfTBZZGQoXABAGSw==',
    ],
  },
  {
    id: 2641,
    title: 'JlUmCgEGVVoZARJaDUV7AgAO',
    author: 'Ils5S04tGl8DAR8I',
    genre: 'Romance',
    era: 'Edwardian',
    authorNationality: 'British',
    emoticons: '🏠🌅💕🇮🇹🪟',
    notableQuotes: [
      'MBBUBg8YAQ0RVQkSDQFCHEUWCVUHCgMOAUUZGx1aGw1IGQAPAgdUEgtLBlkRGx5U',
      'KxwSAE4CBg0VFAkDTBFCSwYRFRoaDA0HEAFQFw8OTAdIHAwVAxAGDAAMVVkfVQoIDQZZAgYcSQ==',
    ],
  },
  {
    id: 408,
    title: 'Mx0RRT0EAEEDVRUcTCdBCgYSRzMbCQU=',
    author: 'MFsxSyxFVWkFVTgVBRY=',
    genre: 'Essays',
    era: 'Early 20th Century',
    authorNationality: 'American',
    emoticons: '✊🎵📚🌿💭',
    notableQuotes: [
      'Mx0RRR4ZGk8cEBdaAwMNHw0cRwEDAAAfHEgEHVoZCQtZHhcARxwHRRoDEA0ABxUYAABASwofRwEcAE4IGkEfB1oWBQtIRQ==',
      'IhwADQsZVWwdEAgTDwQNHAwVC1UQAB0fB0IJVRMdAgpfCgsaAlUbF04CEkMfBxsUDwANHAwVC1UQAB0fB0IJVTsXCRdECARX',
    ],
  },
  {
    id: 16389,
    title: 'Mx0RRSsFFkURGw4fCEVsGxcQCw==',
    author: 'IhkdHw8JEFkYVQwVAkVsGQsQCg==',
    genre: 'Romance',
    era: 'Interwar',
    authorNationality: 'British',
    emoticons: '🌸🏰🇮🇹☀️💐',
    notableQuotes: [
      'Mx0RRR0OFl8VAVoVCkVBAgMcRxwHRQcFVUwABQgfDwxMHwwXAFUdER1LF0EVBgkTAgJeRQ==',
      'IgMRFxdLGEIdEBQOTApLSxERDgZUJB4ZHEFQAhMWAEVPDkUYCxwCAEA=',
    ],
  },
  {
    id: 8492,
    title: 'Mx0RRSUCG0pQHBRaNQBBBwoO',
    author: 'NRoWABwfVXpeVTkSDQhPDhcK',
    genre: 'Horror',
    era: 'Victorian',
    authorNationality: 'American',
    emoticons: '👑💛🎭😱📖',
    notableQuotes: [
      'LxQCAE4SGlhQExUPAgENHw0cRywRCQIEAg0jHB0UUw==',
      'Mx0RRSUCG0pQHBRaNQBBBwoORxgBFhpLG0IEVRgfTAFIGAYLDhcRAUA=',
    ],
  },
  {
    id: 67979,
    title: 'Mx0RRSwHAEhQNhsJGAlI',
    author: 'K1s5S04mGkMEEhUXCRdU',
    genre: 'Romance',
    era: 'Interwar',
    authorNationality: 'Canadian',
    emoticons: '🏰💙💕🌲✨',
    notableQuotes: [
      'LlIYCU4JEA0HHBkRCQENCgsdRxMGDBgEGUIFBloOA0VZAwBZAhsQRQENVUAJVR4bFRYD',
      'IRAVF04CBg0EHR9aAxdEDAwXBhlUFgcFWw==',
    ],
  },
  {
    id: 70875,
    title: 'JgcGChkYGEQEHQ==',
    author: 'NBwaBgIKHF9QOR8NBRY=',
    genre: 'Social Novel',
    era: 'Jazz Age',
    authorNationality: 'American',
    emoticons: '🔬💉🏥📚🧪',
    notableQuotes: [
      'Mx0RRR4eB10fBh9aAwMNCkUMCRwCABwYHFkJVRMJTAtCH0UNCFUEFwEPAE4VVRkVAgNCGQgQFAEHSw==',
      'NBYdAAAIEA0ZBloWAwtIBxxZEBoGDkA=',
    ],
  },
  {
    id: 394,
    title: 'JAcVCwgEB0k=',
    author: 'IhkdHw8JEFkYVT0bHw5IBwk=',
    genre: 'Social Novel',
    era: 'Victorian',
    authorNationality: 'British',
    emoticons: '👵🏡🍵👗💬',
    notableQuotes: [
      'JAcVCwgEB0lQHAlaBQsNGwoKFBAHFgcEGw0fE1oOBAANKggYHRoaFkA=',
      'JlUZBABLHF5QBhVaBQsNHw0cRwIVHE4CGw0EHR9aBApYGABX',
    ],
  },
  {
    id: 986,
    title: 'KhQHEQsZVUweEVo3DQs=',
    author: 'KxAbRToEGV4EGgM=',
    genre: 'Novella',
    era: 'Victorian',
    authorNationality: 'Russian',
    emoticons: '❄️🐴💰👨‍🌾🌨️',
    notableQuotes: [
      'MB0VEU4CBg0EHR9aAQBMBQwXAFUbA04GDA0cHBwfUw==',
      'MBBUBg8FVUIeGQNaBwtCHEUNDxQARRkOVUYeGg1aAgpZAwwXAFs=',
    ],
  },
  {
    id: 3600,
    title: 'Mx0RRSsYBkwJBloVCkVgBAsNBhwTCws=',
    author: 'KhwXDQsHVUkVVTcVAhFMAgIXAg==',
    genre: 'Essays',
    era: 'Renaissance',
    authorNationality: 'French',
    emoticons: '📜✍️💭🏰🍷',
    notableQuotes: [
      'NgARRR0KHF5dHx9FTE16AwQNRxEbRSdLHkMfAkVT',
      'Mx0RRQEFGVRQARITAgINCAALExQdC04CBg0EHRsOTAtCHw0QCRJUDB1LFkgCARsTAks=',
    ],
  },
] as const;

let _decodedBooks: GutenGuessBook[] | null = null;

/**
 * Get decoded books. Lazily decodes on first access.
 */
export function getGutenGuessBooks(): readonly GutenGuessBook[] {
  if (!_decodedBooks) {
    _decodedBooks = GUTENGUESS_BOOKS_ENCODED.map((book) => ({
      ...book,
      title: deobfuscate(book.title),
      author: deobfuscate(book.author),
      notableQuotes: book.notableQuotes.map(deobfuscate),
    }));
  }
  return _decodedBooks;
}

export const GUTENGUESS_BOOK_COUNT = GUTENGUESS_BOOKS_ENCODED.length;
