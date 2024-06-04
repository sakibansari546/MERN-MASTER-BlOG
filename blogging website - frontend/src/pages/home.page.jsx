import React from 'react'
import AnimationWrapper from '../common/page-animation'
import InPageNavigation from '../components/inpage-navigation.component'

const HomePage = () => {
    return (
        <>
            <AnimationWrapper>
                <section className='h-cover flex justify-center gap-10'>
                    {/* Tatest Blogs */}
                    <div className='w-full'>
                        <InPageNavigation routes={['home', 'trending blogs']} defaultHidden={['trending blogs']}>
                            <h1>Latest Blog</h1>
                            <h1>Trending Blogs</h1>
                        </InPageNavigation>
                    </div>

                    {/* fillters and trending Bsogs */}
                    <div>
                        tranding
                    </div>

                </section>
            </AnimationWrapper>
        </>
    )
}

export default HomePage
