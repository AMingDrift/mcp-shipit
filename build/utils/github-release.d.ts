/**
 * 获取或创建 GitHub Release
 * @param tagName 标签名称
 * @returns Promise<Release> GitHub Release 对象
 */
export declare function getOrCreateRelease(tagName?: string): Promise<{
    url: string;
    html_url: string;
    assets_url: string;
    upload_url: string;
    tarball_url: string | null;
    zipball_url: string | null;
    id: number;
    node_id: string;
    tag_name: string;
    target_commitish: string;
    name: string | null;
    body?: string | null;
    draft: boolean;
    prerelease: boolean;
    immutable?: boolean;
    created_at: string;
    published_at: string | null;
    updated_at?: string | null;
    author: {
        name?: string | null;
        email?: string | null;
        login: string;
        id: number;
        node_id: string;
        avatar_url: string;
        gravatar_id: string | null;
        url: string;
        html_url: string;
        followers_url: string;
        following_url: string;
        gists_url: string;
        starred_url: string;
        subscriptions_url: string;
        organizations_url: string;
        repos_url: string;
        events_url: string;
        received_events_url: string;
        type: string;
        site_admin: boolean;
        starred_at?: string;
        user_view_type?: string;
    };
    assets: {
        url: string;
        browser_download_url: string;
        id: number;
        node_id: string;
        name: string;
        label: string | null;
        state: "uploaded" | "open";
        content_type: string;
        size: number;
        digest: string | null;
        download_count: number;
        created_at: string;
        updated_at: string;
        uploader: {
            name?: string | null;
            email?: string | null;
            login: string;
            id: number;
            node_id: string;
            avatar_url: string;
            gravatar_id: string | null;
            url: string;
            html_url: string;
            followers_url: string;
            following_url: string;
            gists_url: string;
            starred_url: string;
            subscriptions_url: string;
            organizations_url: string;
            repos_url: string;
            events_url: string;
            received_events_url: string;
            type: string;
            site_admin: boolean;
            starred_at?: string;
            user_view_type?: string;
        } | null;
    }[];
    body_html?: string;
    body_text?: string;
    mentions_count?: number;
    discussion_url?: string;
    reactions?: {
        url: string;
        total_count: number;
        "+1": number;
        "-1": number;
        laugh: number;
        confused: number;
        heart: number;
        hooray: number;
        eyes: number;
        rocket: number;
    };
}>;
/**
 * 上传文件到 GitHub Release
 * @param releaseId Release ID
 * @param filePath 要上传的文件路径
 * @param filename 上传后的文件名
 * @returns Promise<string> 文件下载URL
 */
export declare function uploadToRelease(releaseId: number, filePath: string, filename: string): Promise<string>;
