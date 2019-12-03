// State
// 値の型定義
export interface S {
  count: number
}

// Getters
// 返り値の型定義
export interface G {}

// RootGetters
export type RG = {
  [K in keyof G]: G[K]
}

// Mutations
// Payloadの型定義
export interface M {
  increment: {}
}

// RootMutations
export type RM = {
  [K in keyof M]: M[K]
}

// Actions
// Payloadの型定義
export interface A {}

// RootActions
export type RA = {
  [K in keyof A]: A[K]
}
