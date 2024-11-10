const core = require('@actions/core');
const exec = require('@actions/exec');
const tc = require('@actions/tool-cache');
const os = require('os');

const BASE_URL = 'https://github.com/SteamRE/DepotDownloader';
const TOOL_NAME = 'SteamDepotDownloader';

function getPlatform() {
  switch (os.platform()) {
    case 'win32':
      return 'windows';
    case 'darwin':
      return 'macos';
    case 'linux':
      return 'linux';
    default:
      throw new Error(`Unsupported platform: ${os.platform()}`);
  }
}

function getUrl(version, osPlatform, osArch) {
  const versionPart = version === 'latest' ? 'latest/download' : `download/${version}`;
  return `${BASE_URL}/releases/${versionPart}/DepotDownloader-${osPlatform}-${osArch}.zip`;
}

async function download() {
  const osPlatform = getPlatform();
  core.debug(`platform: ${osPlatform}`);
  const osArch = os.arch();
  core.debug(`arch: ${osArch}`);
  const version = core.getInput('version');
  core.debug(`version: ${version}`);

  core.info(`Checking cache for ${TOOL_NAME} version ${version}`);
  const cachePath = tc.find(TOOL_NAME, version);
  if (cachePath) {
    core.info(`Found in cache: ${cachePath}`);
    core.addPath(cachePath);
    return;
  } else {
    core.notice(`Not found in cache`);
  }

  const url = getUrl(version, osPlatform, osArch);

  core.info(`Downloading ${TOOL_NAME} version ${version} from ${url}`);
  const downloadPath = await tc.downloadTool(url);
  core.debug(`downloadPath: ${downloadPath}`);

  core.info(`Extracting ${downloadPath}`);
  const extractPath = await tc.extractZip(downloadPath);
  core.debug(`extractPath: ${extractPath}`);

  core.info(`Caching ${TOOL_NAME} version ${version}`);
  const newCachePath = await tc.cacheDir(extractPath, TOOL_NAME, version);
  core.debug(`newCachePath: ${newCachePath}`);

  core.addPath(newCachePath);
}

async function test() {
  core.info('Running DepotDownloader to check if it works');
  const exit = await exec.exec('DepotDownloader');
  if (exit !== 0) {
    throw new Error('Failed to run DepotDownloader');
  }
}

async function run() {
  try {
    await download();
    await test();

    core.info('DepotDownloader is ready to use');
  } catch (error) {
    core.setFailed(error.message);
  }
}

module.exports = {run}