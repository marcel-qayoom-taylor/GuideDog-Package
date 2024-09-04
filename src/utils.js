'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.');
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y['return']
                  : op[0]
                    ? y['throw'] || ((t = y['return']) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.getValue = exports.add = void 0;
exports.improveSemantics = improveSemantics;
var openai_1 = require('openai');
var fs = require('fs/promises');
var child_process_1 = require('child_process');
var add = function (a, b) {
  return a + b;
};
exports.add = add;
var getValue = function (value) {
  return console.log(value);
};
exports.getValue = getValue;
function improveSemantics() {
  return __awaiter(this, void 0, void 0, function () {
    var improvedHtml, error_1;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          return [
            4 /*yield*/,
            improveHtmlSemantics({
              htmlFilePath: './index.html',
              openAIApiKey: 'your-api-key-here',
              openAIModel: 'gpt-4o-mini',
              openVSCode: true,
            }),
          ];
        case 1:
          improvedHtml = _a.sent();
          console.log('Improved HTML:', improvedHtml);
          return [3 /*break*/, 3];
        case 2:
          error_1 = _a.sent();
          console.error('Error improving HTML:', error_1);
          return [3 /*break*/, 3];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
function improveHtmlSemantics(_a) {
  return __awaiter(this, arguments, void 0, function (_b) {
    var client, htmlContent, prompt_1, completion, improvedHtml, error_2;
    var htmlFilePath = _b.htmlFilePath,
      openAIApiKey = _b.openAIApiKey,
      _c = _b.openAIModel,
      openAIModel = _c === void 0 ? 'gpt-4o-mini' : _c,
      _d = _b.openVSCode,
      openVSCode = _d === void 0 ? false : _d;
    return __generator(this, function (_e) {
      switch (_e.label) {
        case 0:
          client = new openai_1.OpenAI({ apiKey: openAIApiKey });
          _e.label = 1;
        case 1:
          _e.trys.push([1, 5, , 6]);
          return [4 /*yield*/, fs.readFile(htmlFilePath, 'utf8')];
        case 2:
          htmlContent = _e.sent();
          prompt_1 =
            'Please make the following HTML more semantic and accessible. Consider using header tags instead of just <p> or using <section>/<article> instead of <div> where appropriate. Do not response with any other words or content EXCEPT for the html code. Also do not include html at the start or at the end. This is extremely important. Here is the HTML content:\n\n'.concat(
              htmlContent,
            );
          return [
            4 /*yield*/,
            client.chat.completions.create({
              model: openAIModel,
              messages: [
                {
                  role: 'system',
                  content:
                    'You are a front-end developer that is an expert in semantic HTML. You are helping a colleague improve the semantic structure of their HTML code to make it more accessible. You are not allowed to change any content or words in the HTML code except for the HTML tags and the attributes of those tags. You can also add new tags or attributes where necessary.',
                },
                { role: 'user', content: prompt_1 },
              ],
            }),
          ];
        case 3:
          completion = _e.sent();
          improvedHtml = completion.choices[0].message.content || '';
          return [
            4 /*yield*/,
            fs.writeFile(htmlFilePath, improvedHtml, 'utf8'),
          ];
        case 4:
          _e.sent();
          console.log(
            'The file '.concat(htmlFilePath, ' has been updated successfully.'),
          );
          if (openVSCode) {
            (0, child_process_1.exec)(
              'git difftool '.concat(htmlFilePath),
              function (error, stdout, stderr) {
                if (error) {
                  console.log(
                    'Failed to open VSCode with git difftool. Make sure git is installed and configured correctly.',
                  );
                  return;
                }
                if (stderr) {
                  console.log('stderr: '.concat(stderr));
                  return;
                }
                console.log(
                  'Opened working tree changes for '.concat(
                    htmlFilePath,
                    ' in VSCode.',
                  ),
                );
              },
            );
          }
          return [2 /*return*/, improvedHtml];
        case 5:
          error_2 = _e.sent();
          console.error('An error occurred:', error_2);
          throw error_2;
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
improveSemantics();
