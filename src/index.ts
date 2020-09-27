import axios, { AxiosResponse } from 'axios';
import cheerio from 'cheerio';

interface IBusinessSearchData {
    address_city: string;
    license: number;
    slug: string;
};

(async () => {
    // I-502
    const url = 'https://502data.com/allproducerprocessors';

    const axiosResponse = await axios.get(url);

    const $ = cheerio.load(axiosResponse.data);

    const script = $('script:nth-of-type(7)').html();

    const scriptSplit = script?.split('$scope.licenses = ');
    let arrayOfbusinesses: any[] = [];
    if (scriptSplit) {
        arrayOfbusinesses = JSON.parse(scriptSplit[1].split(';')[0]);
    }

    for (let i = 0; i < 6; i++) {
        try {
            const businessSearchData = await getSlugFromTopShelfData(arrayOfbusinesses[i].name, arrayOfbusinesses[i].city);

            await timeout(1000);

            await checkTopShelfDataDetails(businessSearchData);

            
            await timeout(1000);
        }
        catch (e) {
            console.log('Error up top');
        }
    }

})();

export async function checkTopShelfDataDetails(businessSearchData: IBusinessSearchData) {
    const url = `https://www.topshelfdata.com/wa/${businessSearchData.address_city}/${businessSearchData.slug}`;

    let axiosResponse: AxiosResponse;

    try {
        axiosResponse = await axios.get(url);
    }
    catch (e) {
        console.log('e', e.response ? e.response.status : e.errno);
        throw '';
    }

    const $ = cheerio.load(axiosResponse.data);

    const title = $('.business-info div:nth-of-type(3) a').text();

    console.log('title', title);
}

export async function getSlugFromTopShelfData(businessName: string, city: string): Promise<IBusinessSearchData> {
    const url = `https://www.topshelfdata.com/search?query=${businessName}`;
    const convertedCity = city.toLocaleLowerCase().replace(/\s/g, '-');

    const axiosResponse = await axios.get(url);
    const suggestions = axiosResponse.data?.suggestions;

    const foundBusiness = suggestions.find(suggestion => suggestion?.data?.address_city.includes(convertedCity));

    return foundBusiness?.data;
}


export function timeout(ms: number) {
	return new Promise(res => setTimeout(res, ms));
}