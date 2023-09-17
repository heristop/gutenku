import dotenv from 'dotenv';
import { expect, it } from '@jest/globals';
import HaikuHelper from '../src/shared/helpers/HaikuHelper';

dotenv.config();

it('extract context verses', async () => {
    const chapter = "When serenely advancing on one of these journeys, if any strange suspicious sights are seen, my lord whale keeps a wary eye on his interesting family. Should any unwarrantably pert young Leviathan coming that way, presume to draw confidentially close to one of the ladies, with what prodigious fury the Bashaw assails him, and chases him away! High times, indeed, if unprincipled young rakes like him are to be permitted to invade the sanctity of domestic bliss; though do what the Bashaw will, he cannot keep the most notorious Lothario out of his bed; for, alas! all fish bed in common. As ashore, the ladies often cause the most terrible duels among their rival admirers; just so with the whales, who sometimes come to deadly battle, and all for love. They fence with their long lower jaws, sometimes locking them together, and so striving for the supremacy like elks that warringly interweave their antlers. Not a few are captured having the deep scars of these encounters,--furrowed heads, broken teeth, scolloped fins; and in some instances, wrenched and dislocated mouths."    
    const substring = "though do what the Bashaw will";
    const numWords = 5;
    const numSentences = 2;

    const contextArray = HaikuHelper.findContext(chapter, substring, numWords, numSentences);

    expect(contextArray.wordsBefore).toEqual('sanctity of domestic bliss; ');
    expect(contextArray.sentenceBefore).toEqual('indeed, if unprincipled young rakes like him are to be permitted to invade the sanctity of domestic bliss;');
    expect(contextArray.wordsAfter).toEqual(', he cannot keep the');
    expect(contextArray.sentenceAfter).toEqual('When serenely advancing on one of these journeys, if any strange suspicious sights are seen,');
});
