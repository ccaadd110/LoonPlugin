/*
 * 知乎去广告脚本 for Loon
 * 功能：移除首页推荐流、回答页、搜索页、热榜、评论区广告及推广卡片
 * 匹配域名：api.zhihu.com, appcloud2.zhihu.com, www.zhihu.com
 */

const url = $request.url;
let body = $response.body;

try {
    let obj = JSON.parse(body);

    // 通用过滤函数：移除数组中的广告项
    function removeAds(arr) {
        if (!Array.isArray(arr)) return arr;
        return arr.filter(item => {
            if (!item) return true;
            // 标准广告类型
            const adTypes = ['feed_ad', 'commercial', 'cmmercial', 'market_card', 'ad', 'live', 'goods'];
            if (adTypes.includes(item.type)) return false;
            // 广告标记字段
            if (item.ad || item.adjson || item.ad_json || item.is_ad || item.ad_url) return false;
            // 推广内容：会员、直播、商品
            if (item.common_card?.feed_content?.attachment?.type === 'live') return false;
            if (item.common_card?.feed_content?.attachment?.type === 'goods') return false;
            return true;
        });
    }

    // 1. 首页推荐流 /topstory/recommend /topstory/home /topstory/follow
    if (url.includes('/topstory/recommend') || url.includes('/topstory/home') || url.includes('/topstory/follow')) {
        if (obj.data) obj.data = removeAds(obj.data);
    }

    // 2. 回答列表 /answers /v4/questions
    if (url.includes('/answers') || url.includes('/v4/questions')) {
        if (obj.data) obj.data = removeAds(obj.data);
    }

    // 3. 搜索页 /search /search_v3
    if (url.includes('/search') || url.includes('/search_v3')) {
        if (obj.data) obj.data = removeAds(obj.data);
    }

    // 4. 热榜 /topstory/hot-list /topstory/hot-lists
    if (url.includes('/topstory/hot-list')) {
        if (obj.data) obj.data = removeAds(obj.data);
    }

    // 5. 评论区 /comments /root_comments /child_comments
    if (url.includes('/comments')) {
        if (obj.data) obj.data = removeAds(obj.data);
    }

    // 6. 个人主页关注问题列表
    if (url.includes('/people') || url.includes('/members')) {
        if (obj.following_question_list?.data) {
            obj.following_question_list.data = removeAds(obj.following_question_list.data);
        }
    }

    // 7. 开屏广告 /app_config /launch /launch_ad
    if (url.includes('/app_config') || url.includes('/launch')) {
        if (obj.ads) obj.ads = [];
        if (obj.ad) delete obj.ad;
        if (obj.ad_info) delete obj.ad_info;
        if (obj.launch) obj.launch = {};
    }

    // 8. 通用配置去广告 appcloud2.zhihu.com/v3/config
    if (url.includes('appcloud2.zhihu.com') && url.includes('/config')) {
        if (obj.config) {
            const adKeys = ['ads', 'ad', 'commercial', 'market_card_config', 'splash_ad', 'feed_ad'];
            adKeys.forEach(key => { if (obj.config[key]) delete obj.config[key]; });
        }
        if (obj.data) obj.data = removeAds(obj.data);
    }

    // 9. 通用字段清理
    if (obj.ad_info) delete obj.ad_info;
    if (obj.adjson) delete obj.adjson;
    if (obj.ad_json) delete obj.ad_json;
    if (obj.ad_url) delete obj.ad_url;

    body = JSON.stringify(obj);
} catch (e) {
    console.log('知乎去广告脚本异常: ' + e.message);
}

$done({ body });
