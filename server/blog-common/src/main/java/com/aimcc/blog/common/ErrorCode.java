package com.aimcc.blog.common;

import lombok.Getter;

/**
 * 统一错误码：状态码 + 默认提示文案。
 *
 * 只放「通用」错误：参数不对、未登录、找不到、太频繁、系统异常这类每个服务都会遇到的。
 * 具体业务文案（比如「文章不存在」）仍然由调用方传，不塞进这里——
 * 否则公共模块会被各个服务的业务语义污染，拆服务就白拆了。
 */
@Getter
public enum ErrorCode {

    SUCCESS(200, "success"),

    BAD_REQUEST(400, "参数不合法"),

    UNAUTHORIZED(401, "未登录或登录已过期"),

    NOT_FOUND(404, "资源不存在"),

    METHOD_NOT_ALLOWED(405, "请求方式不对，请检查 GET/POST"),

    UNSUPPORTED_MEDIA_TYPE(415, "请求格式不对，请使用 application/json"),

    TOO_MANY_REQUESTS(429, "请求太频繁，稍后再试"),

    INTERNAL_ERROR(500, "系统繁忙，请稍后再试");

    /** 返回给前端的业务状态码 */
    private final int code;

    /** 不传具体文案时用的默认提示 */
    private final String defaultMessage;

    ErrorCode(int code, String defaultMessage) {
        this.code = code;
        this.defaultMessage = defaultMessage;
    }
}
