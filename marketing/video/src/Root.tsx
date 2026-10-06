import React from 'react';
import { Composition } from 'remotion';
import { Launch, TOTAL_FRAMES, FPS } from './Launch';

/* Three deliverables from one scene set:
   - LaunchSquare     1080 x 1080  Instagram / Facebook / LinkedIn feed
   - LaunchVertical   1080 x 1920  Reels / Shorts / TikTok / Stories
   - LaunchLandscape  1920 x 1080  YouTube / X / website embed            */
export const Root: React.FC = () => (
  <>
    <Composition id="LaunchSquare" component={Launch} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1080} defaultProps={{}} />
    <Composition id="LaunchVertical" component={Launch} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{}} />
    <Composition id="LaunchLandscape" component={Launch} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1920} height={1080} defaultProps={{}} />
  </>
);
