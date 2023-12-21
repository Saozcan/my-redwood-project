import jwt from 'jsonwebtoken'
import type { MutationResolvers, SkyKullaniciAuth } from 'types/graphql'

import { AuthenticationError } from '@redwoodjs/graphql-server'

import { db } from 'src/lib/db'
import { refreshTokens } from 'src/lib/helper/cache'

export const login: MutationResolvers['login'] = async ({ input }) => {
  const { username, password } = input

  const users = (await db.$queryRaw`
    SELECT kullaniciid AS id, kod, ad, engelle, muhasebekod, \
    dbo.sky_kullanici_ok(${username},${password}) AS kullaniciok, email, bilgeuser \
    FROM sky_kullanici WHERE kod = ${username}`) as SkyKullaniciAuth[]

  if (!users || !users.length || !users[0].kullaniciok) {
    throw new AuthenticationError('Invalid username or password')
  }

  if (users[0].engelle) {
    throw new AuthenticationError('User is blocked')
  }

  const roleTableResponse = await db.skyGrupKullanici.findMany({
    where: { kullanicikod: users[0].kod },
  })

  const roles = roleTableResponse.map((role) => role.grupkod)

  return createToken(users[0], roles)
}

export const refreshToken: MutationResolvers['refreshToken'] = async ({
  input,
}) => {
  const { refreshToken, username } = input
  const user = await db.skyKullanici.findUnique({
    where: { kod: username },
  })
  if (!user) {
    throw new AuthenticationError('No such user found.')
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET
    )
    if (decoded.sub !== user.id) {
      throw new AuthenticationError('Invalid refresh token')
    }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError('Refresh token expired')
    }
    throw new AuthenticationError('Invalid refresh token')
  }

  if (!refreshTokens[user.id]) {
    throw new AuthenticationError('There is no refresh token for this user')
  }

  if (refreshTokens[user.id] !== refreshToken) {
    throw new AuthenticationError('Invalid refresh token')
  }

  return createToken(user)
}

export const logout: MutationResolvers['logout'] = async ({ input }) => {
  const { refreshToken, username } = input
  const user = await db.skyKullanici.findUnique({
    where: { kod: username },
  })
  if (!user) {
    throw new AuthenticationError('No such user found.')
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET
    )
    if (decoded.sub !== user.id) {
      throw new AuthenticationError('Invalid refresh token')
    }
  } catch (error) {
    throw new AuthenticationError('Invalid refresh token')
  }

  if (refreshTokens[user.id] !== refreshToken) {
    throw new AuthenticationError('Invalid refresh token')
  }

  delete refreshTokens[user.id]

  return true
}

/**
 * * Create access and refresh tokens by using user info
 * @param user SkyKullaniciAuth
 * @returns
 */
const createToken = (user: SkyKullaniciAuth, roles?: string[]) => {
  const createdRefreshToken = jwt.sign(
    {
      sub: user.id,
      email: user.email,
    },
    process.env.JWT_REFRESH_TOKEN_SECRET,
    { expiresIn: '30m' }
  )

  refreshTokens[user.id] = createdRefreshToken

  const createdToken = jwt.sign(
    {
      sub: user.id,
      username: user.kod,
      fullname: user.ad,
      email: user.email,
      roles: roles,
      refreshToken: createdRefreshToken,
    },
    process.env.JWT_ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  )
  return { accessToken: createdToken, refreshToken: createdRefreshToken }
}
