import React from 'react';
import Image from 'next/image';

interface ImageContainerProps {
    isSticky: boolean;
    isScrolled: boolean;
    isAdvancedSearchEnabled: boolean;
}

const ImageContainer: React.FC<ImageContainerProps> = ({
    isSticky,
    isScrolled,
    isAdvancedSearchEnabled
}) => {

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none md:block hidden">
            {/* Fixed images for scrolled state */}
            {isSticky && isScrolled && (
                <div className="fixed inset-0">
                    <Image
                        alt="Search Page"
                        className="h-[800px] w-[1500px] right-0 bottom-0"
                        style={{
                            position: 'fixed',
                            color: 'transparent'
                        }}
                        src="/graphics/searchpage.svg"
                        width={0}
                        height={0}
                    />
                    <Image
                        alt="Search Page"
                        className="h-[700px] w-[1350px] right-0 bottom-5"
                        style={{
                            position: 'fixed',
                            color: 'transparent'
                        }}
                        src="/graphics/searchpageicon.svg"
                        width={0}
                        height={0}
                    />
                </div>
            )}

            {/* Absolute images for non-scrolled or footer state */}
            {(!isSticky || !isScrolled) && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="sticky top-0 w-full h-full">
                        <Image
                            alt="Search Page"
                            className="absolute h-[800px] w-[1500px] right-0 bottom-0"
                            style={{
                                color: 'transparent'
                            }}
                            src="/graphics/searchpage.svg"
                            width={0}
                            height={0}
                        />
                        <Image
                            alt="Search Page"
                            className="absolute h-[700px] w-[1350px] right-0 bottom-5"
                            style={{
                                color: 'transparent',
                            }}
                            src="/graphics/searchpageicon.svg"
                            width={0}
                            height={0}
                        />
                    </div>
                </div>
            )}
            {(!isScrolled && isAdvancedSearchEnabled) && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="fixed top-0 w-full h-full">
                        <Image
                            alt="Search Page"
                            className="absolute h-[800px] w-[1500px] right-0 bottom-0"
                            style={{
                                position: 'fixed',
                                color: 'transparent'
                            }}
                            src="/graphics/searchpage.svg"
                            width={0}
                            height={0}
                        />
                        <Image
                            alt="Search Page"
                            className="absolute h-[700px] w-[1350px] right-0 bottom-5"
                            style={{
                                position: 'fixed',
                                color: 'transparent',
                            }}
                            src="/graphics/searchpageicon.svg"
                            width={0}
                            height={0}
                        />
                    </div>
                </div>
            )}



        </div>
    );
};

export default ImageContainer;