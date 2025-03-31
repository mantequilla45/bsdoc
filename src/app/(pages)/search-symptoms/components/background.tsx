import React from 'react';
import Image from 'next/image';


const ImageContainer = () => {
    return (
        <div className="w-full">
            <Image
                alt="Search Page"
                className="absolute flex-grow w-[1500px] right-0 bottom-0"
                src="/graphics/searchpage.svg"
                width={0}
                height={0}
            />
            <Image
                alt="Search Page"
                className="absolute flex-grow w-[800px] bottom-0 md:right-[10%] md:scale-100 scale-[0.7]"
                src="/graphics/searchpageicon.svg"
                width={0}
                height={0}
            />
        </div>
    );
};

export default ImageContainer;