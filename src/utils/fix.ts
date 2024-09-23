import {SuggestRepoChanges} from '@/helpers/ModelHandler';
import * as fs from 'fs/promises';
import config from 'guidedog.config.cjs'; 
import * as dotenv from 'dotenv';


export async function fixFile(dir: string) {
  console.log(`fix specific file at [${dir}]`);
}

async function fixRepo(){
  try{    
    dotenv.config();
    const apiKey = process.env.OPENAI_API_KEY;

    if(apiKey != null){
      const assistantId =  config.assistantId;
      const contextId = config.contextId;
  
      const suggestionList = await SuggestRepoChanges(apiKey, assistantId, contextId);
  
      return suggestionList;
    }
    else{
      throw new Error("No API Key found");
    }
  }
  catch(error){
    console.log("Error getting suggestions for the Repo: " + error);
  }
}

export {fixRepo};
