// Copyright (c) 2019 Swisscom Blockchain AG
// Licensed under MIT License
/**
 * Claim schema meta data.
 */
export interface ISchema {
  attributes: string[];
  name: string;
  revokable: boolean;
  tx?: string;
}
