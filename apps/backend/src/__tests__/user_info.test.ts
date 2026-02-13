import { getLogger } from "trash-common";
const logger = getLogger();
logger.setLevel_DEBUG();

import user_info from '../user_info';

describe('user_info', ()=>{
    it('セッションあり,サインインあり', ()=>{
        const test_data_001 = [{type: 'bottole',schedules:[{type: 'month', value: '13'}]}];
        // パラメータはセッション情報
        const response = user_info(
            {
                id: 'sessionid',
                userInfo: {
                    name: 'testUser',
                    signinId: 'signin-id',
                    signinService: 'amazon',
                    preset: test_data_001
                },
                expire: 999999
            }
        );
        expect(response.statusCode).toBe(200);
        expect(response.body).toBe(JSON.stringify({name: 'testUser', preset: test_data_001, globalExcludes: []}));
    });
    it('セッションあり,サインインなし',()=>{
        const response = user_info({id: 'sessionid', expire: 9999999});
        expect(response.statusCode).toBe(200);
        expect(response.body).toBe(JSON.stringify({name: "", preset: null, globalExcludes: []}));
    });
})
