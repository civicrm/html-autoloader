import js from "@eslint/js";
import globals from "globals";
import json from "@eslint/json";
import { defineConfig } from "eslint/config";
import playwright from 'eslint-plugin-playwright'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig([
  { 
    files: [
      "src/**/*.{js,mjs,cjs}",
      "test/resources/*.js"
    ],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser }
  },
  {
    files: ["tests/*.spec.js"],
    extends: [playwright.configs['flat/recommended']]
  },
  {
    files: ["tests/**/*.json"],
    plugins: { json },
    language: "json/json",
    extends: ["json/recommended"]
  },
  eslintPluginPrettierRecommended
]);
