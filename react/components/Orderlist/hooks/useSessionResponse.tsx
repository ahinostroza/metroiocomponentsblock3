import { useState, useEffect } from 'react'

import { Session, SessionResponse } from 'vtex.render-runtime'
import { getSession } from '../modules/session'

export const useSessionResponse = () => {
    const [session, setSession] = useState<SessionResponse>()
    const sessionPromise = getSession()

    useEffect(() => {
        if (!sessionPromise) {
            return
        }

        sessionPromise.then(sessionResponse => {
            const response = sessionResponse.response as SessionResponse

            setSession(response)
        })
    }, [sessionPromise])

    return session
} 


export function hasSession(session: SessionResponse | undefined): session is Session {
    return (
        session !== undefined &&
        session.type !== 'Unauthorized' &&
        session.type !== 'Forbidden'
    )
}