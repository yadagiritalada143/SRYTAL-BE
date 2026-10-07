"use strict";
/**
 * Bridges the friendly language names used by the LMS (e.g. 'JavaScript',
 * 'Python') to the runtime names understood by the Piston execution API.
 * Also holds the default starter templates shown to employees when a content
 * writer has not supplied a custom starter for a language.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_STARTER_CODE = exports.LANGUAGE_FILE_EXTENSIONS = exports.LANGUAGE_MAP = void 0;
exports.LANGUAGE_MAP = {
    javascript: 'javascript',
    js: 'javascript',
    node: 'javascript',
    nodejs: 'javascript',
    python: 'python',
    python3: 'python',
    py: 'python',
    typescript: 'typescript',
    ts: 'typescript',
    java: 'java',
    c: 'c',
    cpp: 'c++',
    'c++': 'c++'
};
exports.LANGUAGE_FILE_EXTENSIONS = {
    javascript: 'js',
    python: 'py',
    typescript: 'ts',
    java: 'java',
    c: 'c',
    'c++': 'cpp'
};
exports.DEFAULT_STARTER_CODE = {
    javascript: `const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const inputLines = [];

rl.on('line', (line) => {
    inputLines.push(line);
}).on('close', () => {
    // Write your solution here using inputLines
    console.log('Hello World');
});`,
    python: `import sys


def main():
    data = sys.stdin.read().splitlines()
    # Write your solution here
    print("Hello World")


if __name__ == "__main__":
    main()`,
    typescript: `import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const inputLines: string[] = [];

rl.on('line', (line: string) => {
    inputLines.push(line);
}).on('close', () => {
    // Write your solution here using inputLines
    console.log('Hello World');
});`,
    java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Write your solution here
        System.out.println("Hello World");
        sc.close();
    }
}`,
    c: `#include <stdio.h>

int main() {
    // Write your solution here
    printf("Hello World\\n");
    return 0;
}`,
    'c++': `#include <iostream>
using namespace std;

int main() {
    // Write your solution here
    cout << "Hello World" << endl;
    return 0;
}`
};
