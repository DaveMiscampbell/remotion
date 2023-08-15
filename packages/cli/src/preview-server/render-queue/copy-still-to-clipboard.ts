('use-strict');
import fs from 'fs';
import path from 'path';

require('./scripts/set-permissions');

const recursionLimit = 5;

const findClosestPackageJson = (): string | null => {
	let currentDir = __dirname;
	let possiblePackageJson = '';
	for (let i = 0; i < recursionLimit; i++) {
		possiblePackageJson = path.join(currentDir, 'package.json');
		const exists = fs.existsSync(possiblePackageJson);
		if (exists) {
			return possiblePackageJson;
		}

		currentDir = path.dirname(currentDir);
	}

	return null;
};

const {exec} = require('child_process');

const deriveBinaryPath = (binary: string) => {
	const closestPackageJson = findClosestPackageJson() as string;
	return path.resolve(closestPackageJson, `../${binary}`);
};

const isWayland = () => process.env.XDG_SESSION_TYPE === 'wayland';

const run = (cmd: string) => {
	return new Promise<void>((resolve) => {
		exec(cmd, (...args: any) => resolve(args)); // type this better before PR
	});
};

const copyX11 = (file: string) =>
	run(`xclip -sel clip -t image/png -i "${file}"`);

const copyWayland = (file: string) => run(`wl-copy < "${file}"`);

const copyLinux = (file: string) =>
	isWayland() ? copyWayland(file) : copyX11(file);

const copyOsx = (file: string) => {
	const binaryPath = deriveBinaryPath('osx-copy-image');
	return run(`${binaryPath} "${file}"`);
};

const copyWindows = (file: string) => {
	const binaryPath = deriveBinaryPath('file2clip.exe');
	return run(
		`powershell.exe -ExecutionPolicy Bypass Start-Process -NoNewWindow -FilePath ${binaryPath} -ArgumentList "${file}"`
	);
};

export const copyStillToClipBoard = (img: string): Promise<void> => {
	const file = process.cwd() + '/' + img;

	return process.platform === 'win32'
		? copyWindows(file)
		: process.platform === 'darwin'
		? copyOsx(file)
		: copyLinux(file);
};
