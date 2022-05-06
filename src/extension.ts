import * as vscode from "vscode";

let rudiStatusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
  // Första testet. Detta ska vid kommando visa ett skämt.
  const rudiJoke = vscode.commands.registerCommand(
    "rudimentary.joke",
    async () => {
      const axios = require("axios");
      const res = await axios.get("https://geek-jokes.sameerkumar.website/api");
      console.log(res.data);
      vscode.window.showInformationMessage(res.data);
    }
  );

  // En knapp i statusbar längst ner i VS
  rudiStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right
  );
  rudiStatusBarItem.command = "rudimentary.reminder";
  updateStatusBarItem();

  // Den viktiga delen. Detta är Rudimentary's reminder.
  let rudiRemRef: NodeJS.Timeout;
  const rudiReminder = vscode.commands.registerCommand(
    "rudimentary.reminder",
    async () => {
      let message: string =
        "You should take a break. You've been at it for 25 min.";
      let time: number = 1500000;

      const input = vscode.window.showInputBox({
        prompt: "What's the message you want me to remind you with? ",
      });
      input
        .then((success) => {
          if (message) {
            message = <string>success;
            vscode.window.showInformationMessage("Custom message is set.");
          } else {
            vscode.window.showInformationMessage("Default message is set.");
          }
        })
        .then(() => {
          const input2 = vscode.window.showInputBox({
            placeHolder: "In minutes",
            prompt: "How often should I remind you? ",
          });
          input2.then((success) => {
            const input = parseInt(<string>success || "");
            if (!isNaN(input)) {
              time = input * 60000;
              vscode.window.showInformationMessage("Custom timer is set.");
            } else {
              vscode.window.showInformationMessage("Default timer is set.");
            }

            rudiRemRef = setInterval(() => {
              vscode.window.showInformationMessage(message);
            }, time);
          });
        });
    }
  );

  // Detta stänger av remindern.
  const rudiRemoveReminder = vscode.commands.registerCommand(
    "rudimentary.removeReminder",
    () => {
      clearInterval(rudiRemRef);
    }
  );

  //Nedan kommer andra funktioner som jag testat.

  // Rudimentary kommandot "Create a rudi file" skapar en .rudi fil.
  const rudiCreateRudiFile = vscode.commands.registerCommand(
    "rudimentary.createRudiFile",
    async () => {
      if (vscode.workspace.workspaceFolders) {
        const wsedit = new vscode.WorkspaceEdit();
        const wsPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
        const filePath = vscode.Uri.file(wsPath + "/main.rudi");
        vscode.window.showInformationMessage(filePath.toString());
        wsedit.createFile(filePath, { ignoreIfExists: true });
        vscode.workspace.applyEdit(wsedit);
        vscode.window.showInformationMessage("Created a new file: /main.rudi");
      } else {
        vscode.window.showErrorMessage("Please open a folder first.");
      }
    }
  );

  // I en fil som VS tolkar som "plain text" så finns en rudi-snippet som skapar en regex.
  const rudiSnippet = vscode.languages.registerCompletionItemProvider(
    "plaintext",
    {
      provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
      ) {
        // Snippet som gör en RegEx som matchar på ordet cool.
        const snippetCompletion = new vscode.CompletionItem("RegEx");
        snippetCompletion.insertText = new vscode.SnippetString(
          "const regex = new regex(/(?i)(cool)/);"
        );
        const docs: any = new vscode.MarkdownString(
          'Adds simple regex which matches against the word "cool".'
        );
        snippetCompletion.documentation = docs;

        // Skriv Rudi i text editor, så får du förslag på snippets.
        const commandCompletion = new vscode.CompletionItem("Rudi");
        commandCompletion.kind = vscode.CompletionItemKind.Keyword;
        commandCompletion.insertText = "";
        commandCompletion.command = {
          command: "editor.action.triggerSuggest",
          title: "Re-trigger completions...",
        };

        return [snippetCompletion, commandCompletion];
      },
    }
  );

  context.subscriptions.push(
    rudiJoke,
    rudiReminder,
    rudiRemoveReminder,
    rudiCreateRudiFile,
    rudiSnippet,
    rudiStatusBarItem
  );
}

function updateStatusBarItem(): void {
  rudiStatusBarItem.text = "Rudimentary";
  rudiStatusBarItem.show();
}

export function deactivate() {}
