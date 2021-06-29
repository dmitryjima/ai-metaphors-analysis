import React from 'react'
import Helmet from 'react-helmet'
import { NavLink } from 'react-router-dom'


import { useTranslation } from 'react-i18next'


import { useAppSelector } from '../app/hooks'

const EditionsMainPage = () => {
    const { t, i18n, ready } = useTranslation("editionsMain");

    const { editions: editionsState } = useAppSelector(state => state)

    if (editionsState.isEditionsLoading) {
        return (
            <div>
                Loading...
            </div>
        )
    }

    return (
        <>
        <Helmet
            title={t(`title`)}
        /> 
        <div>
            {
                editionsState.editions.map(edition => <NavLink to={`/editions/${edition._id}`} >{edition.name}</NavLink>)
            }
        </div>
        </>
    )
}

export default EditionsMainPage;