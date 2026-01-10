{
  description = "Vite + React + TypeScript project flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    nixpkgs,
    flake-utils,
    ...
  }:
    flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = import nixpkgs {inherit system;};
      in {
        devShells.default = with pkgs;
          mkShell {
            buildInputs = [
              nodejs_25
              nodePackages.npm
              nodePackages.typescript
              nodePackages.vite
            ];
            shellHook = ''
              if [ ! -d node_modules ]; then
                echo "Installing npm dependencies..."
                npm install
              fi
              echo "To run the dev server: npm run dev"
              echo "To build: npm run build"
              echo "Don't forget to set GEMINI_API_KEY in a .env.local file!"
            '';
          };
      }
    );
}
