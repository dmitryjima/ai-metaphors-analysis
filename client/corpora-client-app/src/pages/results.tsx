import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet';

// Global state
import { useTranslation } from 'react-i18next';

// API
import { fetchResults } from '../api/endpoints/results';

// Utils
import useWindowSize from '../utils/useWindowResize';
import { articleToneColorSwitch } from '../components/editionPage/articleRow';

// Stylings
import styled from 'styled-components';
import { LinearProgress, Select, MenuItem, InputLabel } from '@material-ui/core';

// Components
import TonesPieChart, { DataInner, DataOuter } from '../components/resultsPage/tonesPieChart';
import ArticlesLineChart, { ArticleLineChartDataItem } from '../components/resultsPage/articlesLineChart';
import MetaphorsBarChart, { BarChartMetaphorCase, MetaphorsBarChartDataItem } from '../components/resultsPage/metaphorsBarChart';
import MetaphorsBarChartByCountry, { MetaphorsBarChartDataItemByCountry } from '../components/resultsPage/metaphorsBarChartByCountry';


const ResultsContainer = styled.div`
    padding-bottom: 10vh;
`

const TonesArticlesContainer = styled.div`
    display: flex;
    flex-wrap: wrap;

    justify-content: space-around;

    h2,
    h3,
    .articlesChartContainer__selectYear {
        width: 100%;
        text-align: center;
    }
    h2 {
        margin-bottom: .3rem;
    }
    & > h3 {
        margin-top: 0;
    }
`

const TonesPieContainer = styled.div`
    display: flex;
    flex-direction: column;


    .tonesPieContainer__legend {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding-left: 35%;

        div {
            display: flex;
            align-items: center;
            margin-bottom: .3rem;
        }
    }
`

interface ToneMarkerProps {
    color: string
}
const ToneMarker = styled.span<ToneMarkerProps>`
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;

    margin-right: .5rem;

    background-color: ${
        props => (
            props.color
        )
    };
`

const ArticlesChartContainer = styled.div`
    display: flex;
    flex-wrap: wrap;

    justify-content: space-around;

    h2,
    h3,
    .articlesChartContainer__selectPeriod {
        width: 100%;
        text-align: center;
    }
    h2 {
        margin-bottom: .3rem;
    }
    & > h3 {
        margin-top: 0;
    }
    .articlesChartContainer__selectPeriod {
        margin-bottom: .5rem;
    }
`

const MetaphorsChartContainer = styled.div`
    display: flex;
    flex-wrap: wrap;

    justify-content: space-around;

    h2,
    h3 {
        width: 100%;
        text-align: center;
    }
    h2 {
        margin-bottom: .3rem;
    }
    h3 {
        margin-top: 0;
    }

    .metaphorsChartContainer__selectTop {
        margin-right: 1rem;
    }
    .metaphorsChartContainer__selectMetaphordsDisplayType {
        text-align: center;
        margin-left: 1rem;
    }
`


interface LangGroup {
    _id: string,
    articles: any[]
}

interface DataInnerOuter {
    inner: DataInner[],
    outer: DataOuter[]
}

function mapArticlesTonesInnerData(langGroup: LangGroup):DataInnerOuter {
    // Inner - languages/countries
    let resultInner:DataInner[] = [
        {
            name: `positive`,
            value: 0
        },
        {
            name: `negative`,
            value: 0
        },
        {
            name: `neutral`,
            value: 0
        }
    ]

    let positive = langGroup.articles.filter(a => a.tone === `positive`);
    let negative = langGroup.articles.filter(a => a.tone === `negative`);
    let neutral = langGroup.articles.filter(a => a.tone === `neutral`);

    resultInner[0].value = positive.length;
    resultInner[1].value = negative.length;
    resultInner[2].value = neutral.length;



    // Outer - editions
    let resultOuter: DataOuter[] = [];

    let positiveByEdition:any[] = [];

    for (let i = 0; i < positive.length; i++) {
        let index = positiveByEdition.findIndex(item => item.name === positive[i].edition[0].name)
        if (index === -1) {
            positiveByEdition = [
                ...positiveByEdition, 
                { 
                    name: positive[i].edition[0].name, 
                    fill: `positive`,
                    value: 1 
                }
            ]
        } else {
            positiveByEdition[index].value += 1
        }
    }

    if (positiveByEdition.length > 0) {
        positiveByEdition = positiveByEdition.sort((a, b) => a.value !== b.value ? ( a.value > b.value ? -1 : 1) : 0);
    }
    positiveByEdition = positiveByEdition.map((item, index) => ({
        ...item,
        fillOpacity: 1 - (index * 0.15)
    }))

    let negativeByEdition:any[] = [];

    for (let i = 0; i < negative.length; i++) {
        let index = negativeByEdition.findIndex(item => item.name === negative[i].edition[0].name)
        if (index === -1) {
            negativeByEdition = [
                ...negativeByEdition, 
                { 
                    name: negative[i].edition[0].name, 
                    fill: `negative`,
                    value: 1 
                }
            ]
        } else {
            negativeByEdition[index].value += 1
        }
    }

    if (negativeByEdition.length > 0) {
        negativeByEdition = negativeByEdition.sort((a, b) => a.value !== b.value ? ( a.value > b.value ? -1 : 1) : 0);
    }
    negativeByEdition = negativeByEdition.map((item, index) => ({
        ...item,
        fillOpacity: 1 - (index * 0.15)
    }))

    let neutralByEdition:any[] = [];

    for (let i = 0; i < neutral.length; i++) {
        let index = neutralByEdition.findIndex(item => item.name === neutral[i].edition[0].name)
        if (index === -1) {
            neutralByEdition = [
                ...neutralByEdition, 
                { 
                    name: neutral[i].edition[0].name, 
                    fill: `neutral`,
                    value: 1 
                }
            ]
        } else {
            neutralByEdition[index].value += 1
        }
    }

    if (neutralByEdition.length > 0) {
        neutralByEdition = neutralByEdition.sort((a, b) => a.value !== b.value ? ( a.value > b.value ? -1 : 1) : 0);
    }
    neutralByEdition = neutralByEdition.map((item, index) => ({
        ...item,
        fillOpacity: 1 - (index * 0.15)
    }))

    resultOuter = [...positiveByEdition, ...negativeByEdition, ...neutralByEdition];

    return {
        inner: resultInner,
        outer: resultOuter
    }
}

const ResultsPage = () => {
    // Global state & translations
    const { t, i18n } = useTranslation("results");

    // Window width
    const { width } = useWindowSize();


    // Results
    const [articlesData, setArticlesData] = useState<any[]>([]);
    const [metaphorsData, setMetaphorsData] = useState<any[]>([]);
    const [isResultsLoading, setIsResultsLoading] = useState(false);


    // Articles tone analysis
    const [selectedPeriod, setSelectedPeriod] = useState('all');
    const [tonesArticlesData, setTonesArticlesData] = useState<any[]>([]);

    // Articles line chart
    const [lineChartPeriod, setLineChartPeriod] = useState('byYear');
    const [articlesLineChartData, setArticlesLineChartData] = useState<ArticleLineChartDataItem[]>([]);

    // Articles line chart
    const [metaphorsDisplayType, setMetaphorsDisplayType] = useState('all');
    const [metaphorsBarChartTop, setMetaphorsBarChartTop] = useState(5);

    const [metaphorsBarChartData, setMetaphorsBarChartData] = useState<MetaphorsBarChartDataItem[]>([]);
    const [metaphorsBarChartDataByCountry, setMetaphorsBarChartDataByCountry] = useState<MetaphorsBarChartDataItemByCountry[][]>([]);


    // Fetch results
    useEffect(() => {
        async function fetchAndSetResults() {
            try {
                setIsResultsLoading(true);

                const { 
                    resultsArticles,
                    resultsMetaphorModels 
                } = await fetchResults();

                setArticlesData(articlesData => [...resultsArticles]);

                setMetaphorsData(metaphorsData => [...resultsMetaphorModels]);

                setIsResultsLoading(false);                
            } catch (err) {
                setIsResultsLoading(false);
                console.log(err);
            }
        }

        fetchAndSetResults();
    }, []);

    // Set tone articles data
    useEffect(() => {
        if (selectedPeriod === 'all') {
            setTonesArticlesData([...articlesData]);
        } else {
            let selectedYear = new Date(selectedPeriod).getFullYear();

            let working: any = JSON.stringify(articlesData);
            working = JSON.parse(working) as [];

            let workingFiltered = working.map((langGroup: any) => {
                let filteredGroup = {
                    _id: langGroup._id,
                    articles: []
                }

                filteredGroup.articles = langGroup.articles.filter((a: any) => new Date(a.publication_date).getFullYear() === selectedYear)

                return filteredGroup;
            });

            setTonesArticlesData(tonesArticlesData => [...workingFiltered]);
        }

    }, [articlesData, selectedPeriod]);


    // Set articles line chart data
    useEffect(() => {
        if (articlesData.length > 0) {
            let workingArticles: any = JSON.stringify(articlesData);
            workingArticles = JSON.parse(workingArticles) as [];
    
            const workingData: ArticleLineChartDataItem[] = [];
    
            if (lineChartPeriod === 'byMonth') {
                
                for (let i = 0; i < 60; i++) {
                    let prevPeriod = i === 0 ? new Date() : new Date(workingData[i - 1].period)
                    let newPeriod = i === 0 ? new Date('2016-01-01') : new Date(prevPeriod?.setMonth(prevPeriod.getMonth() + 1));
        
                    let periodCompare = new Date(newPeriod).setHours(0,0,0,0);
        
                    // En
                    let enArticles = workingArticles.find((langGroup: any) => langGroup._id === 'en')?.articles ?? [];
    
                    let enArticlesFiltered = enArticles.filter((a: any) => {
                        let artDate = new Date(new Date(a.publication_date).setDate(1)).setHours(0,0,0,0);
    
                        if (artDate === periodCompare) {
                            return true
                        } else {
                            return false
                        }
                    })
    
                    let enNumMetaphors = enArticlesFiltered.reduce((acc: number, article: any) => {
                        return acc + article.metaphors ? article.metaphors.length : 0
                    }, 0);
    
                    // Ru
                    let ruArticles = workingArticles.find((langGroup: any) => langGroup._id === 'ru')?.articles ?? [];
    
                    let ruArticlesFiltered = ruArticles.filter((a: any) => {
                        let artDate = new Date(new Date(a.publication_date).setDate(1)).setHours(0,0,0,0);
    
                        if (artDate === periodCompare) {
                            return true
                        } else {
                            return false
                        }
                    })
    
                    let ruNumMetaphors = ruArticlesFiltered.reduce((acc: number, article: any) => {
                        return acc + article.metaphors ? article.metaphors.length : 0
                    }, 0);
    
                    // Zh
                    let zhArticles = workingArticles.find((langGroup: any) => langGroup._id === 'zh')?.articles ?? [];
    
                    let zhArticlesFiltered = zhArticles.filter((a: any) => {
                        let artDate = new Date(new Date(a.publication_date).setDate(1)).setHours(0,0,0,0);
    
                        if (artDate === periodCompare) {
                            return true
                        } else {
                            return false
                        }
                    })
    
                    let zhNumMetaphors = zhArticlesFiltered.reduce((acc: number, article: any) => {
                        return acc + article.metaphors ? article.metaphors.length : 0
                    }, 0);
    
    
                    let scaffoldObj:ArticleLineChartDataItem = {
                        period: newPeriod.toDateString(),
                        enNumArticles: enArticlesFiltered.length,
                        enNumMetaphors: enNumMetaphors,
                        zhNumArticles: zhArticlesFiltered.length,
                        zhNumMetaphors: zhNumMetaphors,
                        ruNumArticles: ruArticlesFiltered.length,
                        ruNumMetaphors: ruNumMetaphors,
                    }
                    workingData.push(scaffoldObj);
                }

            } else {
                for (let i = 0; i < 5; i++) {
                    let prevPeriod = i === 0 ? new Date('2016-01-01') : new Date(workingData[i - 1].period)
                    let newPeriod = i === 0 ? new Date('2017-01-01') : new Date(new Date(prevPeriod!!).setFullYear(prevPeriod.getFullYear() + 1));
        
                    let periodCompare = new Date(newPeriod).setHours(0,0,0,0);
                    let periodComparePrev = new Date(prevPeriod).setHours(0,0,0,0);
        
                    // En
                    let enArticles = workingArticles.find((langGroup: any) => langGroup._id === 'en')?.articles ?? [];
    
                    let enArticlesFiltered = enArticles.filter((a: any) => {
                        let artDate = new Date(new Date(a.publication_date).setDate(1)).setHours(0,0,0,0);
    
                        if (artDate >= periodComparePrev && artDate < periodCompare) {
                            return true
                        } else {
                            return false
                        }
                    })
    
                    let enNumMetaphors = enArticlesFiltered.reduce((acc: number, article: any) => {
                        return acc + (article.metaphors ? article.metaphors.length : 0)
                    }, 0);
    
                    // Ru
                    let ruArticles = workingArticles.find((langGroup: any) => langGroup._id === 'ru')?.articles ?? [];
    
                    let ruArticlesFiltered = ruArticles.filter((a: any) => {
                        let artDate = new Date(new Date(a.publication_date).setDate(1)).setHours(0,0,0,0);
    
                        if (artDate >= periodComparePrev && artDate < periodCompare) {
                            return true
                        } else {
                            return false
                        }
                    })
    
                    let ruNumMetaphors = ruArticlesFiltered.reduce((acc: number, article: any) => {
                        return acc + (article.metaphors ? article.metaphors.length : 0)
                    }, 0);
    
                    // Zh
                    let zhArticles = workingArticles.find((langGroup: any) => langGroup._id === 'zh')?.articles ?? [];
    
                    let zhArticlesFiltered = zhArticles.filter((a: any) => {
                        let artDate = new Date(new Date(a.publication_date).setDate(1)).setHours(0,0,0,0);
    
                        if (artDate >= periodComparePrev && artDate < periodCompare) {
                            return true
                        } else {
                            return false
                        }
                    })
    
                    let zhNumMetaphors = zhArticlesFiltered.reduce((acc: number, article: any) => {
                        return acc + (article.metaphors ? article.metaphors.length : 0)
                    }, 0);
    
    
                    let scaffoldObj:ArticleLineChartDataItem = {
                        period: newPeriod.toDateString(),
                        displayPeriod: prevPeriod.getFullYear().toString(),
                        enNumArticles: enArticlesFiltered.length,
                        enNumMetaphors: enNumMetaphors,
                        zhNumArticles: zhArticlesFiltered.length,
                        zhNumMetaphors: zhNumMetaphors,
                        ruNumArticles: ruArticlesFiltered.length,
                        ruNumMetaphors: ruNumMetaphors,
                    }
                    workingData.push(scaffoldObj);
                }
            }

    
            setArticlesLineChartData(articlesLineChartData => [...workingData]);

        }
    }, [articlesData, lineChartPeriod]);


    // Set metaphors bar chart data
    useEffect(() => {
        if (metaphorsData.length > 0) {
            let workingMetaphorModels: any = JSON.stringify(metaphorsData);
            workingMetaphorModels = JSON.parse(workingMetaphorModels) as [];

            workingMetaphorModels = workingMetaphorModels.slice(0, metaphorsBarChartTop);
    
            const workingData: MetaphorsBarChartDataItem[] = [];

            for (let i in workingMetaphorModels) {
                let en = workingMetaphorModels[i].metaphors.filter((m: BarChartMetaphorCase) => m.lang === 'en');
                let zh = workingMetaphorModels[i].metaphors.filter((m: BarChartMetaphorCase) => m.lang === 'zh');
                let ru = workingMetaphorModels[i].metaphors.filter((m: BarChartMetaphorCase) => m.lang === 'ru');

                let newDataItem: MetaphorsBarChartDataItem = {
                    name: workingMetaphorModels[i].name,
                    enMetaphors: en,
                    enMetaphorsNum: en.length,
                    zhMetaphors: zh,
                    zhMetaphorsNum: zh.length,
                    ruMetaphors: ru,
                    ruMetaphorsNum: ru.length,
                }

                workingData.push(newDataItem);
            }

            setMetaphorsBarChartData(metaphorsBarChartData => [...workingData]);
        }
    }, [metaphorsData, metaphorsBarChartTop])

    useEffect(() => {
        let workingMetaphorModels: any = JSON.stringify(metaphorsData);
        workingMetaphorModels = JSON.parse(workingMetaphorModels) as [];
        
        let workingDataByCountry: MetaphorsBarChartDataItemByCountry[][] = [[], [], []];

        if (metaphorsData.length > 0) {
            let models_en: any[] = [];
            let models_ru: any[] = [];
            let models_zh: any[] = [];

            for (let i in workingMetaphorModels) {
                let en = workingMetaphorModels[i].metaphors.filter((m: BarChartMetaphorCase) => m.lang === 'en');
                let zh = workingMetaphorModels[i].metaphors.filter((m: BarChartMetaphorCase) => m.lang === 'zh');
                let ru = workingMetaphorModels[i].metaphors.filter((m: BarChartMetaphorCase) => m.lang === 'ru');

                if (en.length > 0) {
                    models_en.push({
                        name: workingMetaphorModels[i].name,
                        metaphors: [...en]
                    })
                }

                if (ru.length > 0) {
                    models_ru.push({
                        name: workingMetaphorModels[i].name,
                        metaphors: [...ru]
                    })
                }

                if (zh.length > 0) {
                    models_zh.push({
                        name: workingMetaphorModels[i].name,
                        metaphors: [...zh]
                    })
                }

            }

            if (models_en && models_en.length > 0){

                models_en = models_en.sort((a: any, b: any)  => b.metaphors.length - a.metaphors.length).slice(0, metaphorsBarChartTop);
    
                for (let i in models_en) {
                    workingDataByCountry[0].push({
                        name: models_en[i].name,
                        lang: 'en',
                        color: '#7371fcdc',
                        metaphors: models_en[i].metaphors,
                        metaphorsNum: models_en[i].metaphors.length
                    })
                }
            }

            if (models_ru && models_ru.length > 0){
                
                models_ru = models_ru.sort((a: any, b: any) => b.metaphors.length - a.metaphors.length).slice(0, metaphorsBarChartTop);

                for (let i in models_ru) {
                    workingDataByCountry[1].push({
                        name: models_ru[i].name,
                        lang: 'ru',
                        color: '#a1d2cef0',
                        metaphors: models_ru[i].metaphors,
                        metaphorsNum: models_ru[i].metaphors.length
                    })
                }
            }

            if (models_zh && models_zh.length > 0){

                models_zh = models_zh.sort((a: any, b: any)  => b.metaphors.length - a.metaphors.length).slice(0, metaphorsBarChartTop);

                for (let i in models_zh) {
                    workingDataByCountry[2].push({
                        name: models_zh[i].name,
                        lang: 'zh',
                        color: '#e87361cc',
                        metaphors: models_zh[i].metaphors,
                        metaphorsNum: models_zh[i].metaphors.length
                    })
                }
            }
        }

        setMetaphorsBarChartDataByCountry(metaphorsBarChartDataByCountry => [...workingDataByCountry])
    }, [metaphorsData, metaphorsBarChartTop])

    return (
        <>
            <Helmet
                title={t(`metatitle`)}
                htmlAttributes={{
                    lang: i18n.language ? i18n.language : 'en'
                }}
            />
            {
                isResultsLoading
                ?
                <LinearProgress />
                :
                <div style={{height: `4px`}}/>
            }
            <ResultsContainer>
                <h1>
                    {t(`heading`)}
                </h1>
                {
                    !isResultsLoading
                    ?
                    <TonesArticlesContainer>
                        <h2>
                            {t(`articlesToneAnalysis.title`)}
                        </h2>
                        <h3>
                            {t(`articlesToneAnalysis.subtitle`)}
                        </h3>
                        <div
                            className="articlesChartContainer__selectYear"
                        >
                            <InputLabel id="selectYearTonesArticles">{t(`articlesToneAnalysis.selectYear`)}</InputLabel>
                            <Select
                                labelId="selectYearTonesArticles"
                                id="selectYearTonesArticles-select"
                                value={selectedPeriod}
                                onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                                    setSelectedPeriod(event.target.value as string);
                                }}
                            >
                                <MenuItem value={`all`}>{t(`articlesToneAnalysis.all`)}</MenuItem>
                                <MenuItem value={`2016`}>2016</MenuItem>
                                <MenuItem value={`2017`}>2017</MenuItem>
                                <MenuItem value={`2018`}>2018</MenuItem>
                                <MenuItem value={`2019`}>2019</MenuItem>
                                <MenuItem value={`2020`}>2020</MenuItem>
                            </Select>
                        </div>
                    {
                        tonesArticlesData.length > 0
                        ?
                        tonesArticlesData
                            .sort()
                            .map((languageGroup) => {
                            let {inner, outer} = mapArticlesTonesInnerData(languageGroup);

                            if (outer.length === 0) return null

                            return (
                                <TonesPieContainer
                                    key={languageGroup._id}
                                >
                                    <h3>
                                        {t(`languages.${languageGroup._id}`)}
                                    </h3>
                                    <TonesPieChart
                                        dataInner={inner}
                                        dataOuter={outer}
                                    />
                                    <div
                                        className="tonesPieContainer__legend"
                                    >
                                        <div>
                                            {t(`articlesToneAnalysis.total`)} {languageGroup.articles.length}
                                        </div>
                                        <div>
                                            <ToneMarker color={articleToneColorSwitch(inner[0].name)}/>{t(`articlesToneAnalysis.positive`)} {inner[0].value}
                                        </div>
                                        <div>
                                            <ToneMarker color={articleToneColorSwitch(inner[1].name)}/>{t(`articlesToneAnalysis.negative`)} {inner[1].value}
                                        </div>
                                        <div>
                                            <ToneMarker color={articleToneColorSwitch(inner[2].name)}/>{t(`articlesToneAnalysis.neutral`)} {inner[2].value}
                                        </div>
                                    </div>
                                </TonesPieContainer>
                            )
                        })
                        :
                        null
                    }
                    </TonesArticlesContainer>
                    :
                    null
                }
                {
                    !isResultsLoading
                    ?
                    <ArticlesChartContainer>
                        <h2>
                            {t(`articlesChart.title`)}
                        </h2>
                        <h3>
                            {t(`articlesChart.subtitle`)}
                        </h3>
                        <div
                            className="articlesChartContainer__selectPeriod"
                        >
                            <InputLabel id="selectTopMetaphors">{t(`articlesChart.selectPeriod`)}</InputLabel>
                            <Select
                                labelId="selectTopMetaphors"
                                id="selectTopMetaphors-select"
                                value={lineChartPeriod}
                                onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                                    setLineChartPeriod(event.target.value as string);
                                }}
                            >
                                <MenuItem value={'byMonth'}>{t(`articlesChart.byMonth`)}</MenuItem>
                                <MenuItem value={'byYear'}>{t(`articlesChart.byYear`)}</MenuItem>
                            </Select>
                        </div>
                    {
                        articlesData.length > 0
                        ?
                        <ArticlesLineChart 
                            width={width > 1025 ? width - 300 : width - 24}
                            height={300}
                            data={articlesLineChartData}
                        />
                        :
                        null
                    }
                    </ArticlesChartContainer>
                    :
                    null
                }
                {
                    !isResultsLoading
                    ?
                    <MetaphorsChartContainer>
                        <h2>
                            {t(`metaphorsChart.title`)}
                        </h2>
                        <h3>
                            {t(`metaphorsChart.subtitle`)}
                        </h3>
                        <div
                            style={{
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'center'
                            }}
                        >
                            <div
                                className="metaphorsChartContainer__selectTop"
                            >
                                <InputLabel id="selectTopMetaphors">{t(`metaphorsChart.selectTop`)}</InputLabel>
                                <Select
                                    labelId="selectTopMetaphors"
                                    id="selectTopMetaphors-select"
                                    value={metaphorsBarChartTop}
                                    onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                                        setMetaphorsBarChartTop(event.target.value as number);
                                    }}
                                >
                                    <MenuItem value={metaphorsData && metaphorsData.length}>{t(`metaphorsChart.selectOption_all`)}</MenuItem>
                                    <MenuItem value={5}>5</MenuItem>
                                    <MenuItem value={10}>10</MenuItem>
                                    <MenuItem value={15}>15</MenuItem>
                                    <MenuItem value={20}>20</MenuItem>
                                    <MenuItem value={25}>25</MenuItem>
                                </Select>
                            </div>
                            <div
                                className="metaphorsChartContainer__selectMetaphordsDisplayType"
                            >
                                <InputLabel id="selectMetaphorsDisplayType">{t(`metaphorsChart.selectToMetaphorsDisplayType`)}</InputLabel>
                                <Select
                                    labelId="selectMetaphorsDisplayType"
                                    id="selectMetaphorsDisplayType-select"
                                    value={metaphorsDisplayType}
                                    onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                                        setMetaphorsDisplayType(event.target.value as string);
                                    }}
                                >
                                    <MenuItem value={`all`}>{t(`metaphorsChart.selectMetaphorsDisplayType_all`)}</MenuItem>
                                    <MenuItem value={`byCountry`}>{t(`metaphorsChart.selectMetaphorsDisplayType_byCountry`)}</MenuItem>
                                </Select>
                            </div>
                        </div>
                    {
                        articlesData.length > 0
                        ?
                        (
                            metaphorsDisplayType === 'all'
                            ?
                            <MetaphorsBarChart
                                width={width > 1025 ? width - 300 : width - 24}
                                height={300}
                                data={metaphorsBarChartData}
                            />
                            :
                            <MetaphorsBarChartByCountry
                                width={width > 1025 ? width - 300 : width - 24}
                                height={300}
                                data={metaphorsBarChartDataByCountry}
                            />
                        )
                        :
                        null
                    }
                    </MetaphorsChartContainer>
                    :
                    null
                }
            </ResultsContainer>
        </>
    )
}

export default ResultsPage;