import { Config } from '@remotion/cli/config';

// Use the Chromium that is already installed instead of downloading one.
Config.setBrowserExecutable(process.env.CHROME_PATH || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell');
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
