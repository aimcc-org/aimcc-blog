package com.aimcc.blog.exception;

import cn.dev33.satoken.exception.NotLoginException;
import com.aimcc.blog.common.ApiResult;
import com.aimcc.blog.common.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.ArrayList;
import java.util.List;

/**
 * 全局异常处理器：public / admin 两个服务的 Controller 抛出的异常，都在这里统一翻译成 ApiResult。
 *
 * 为什么能放在公共模块：两个服务的启动类都在 com.aimcc.blog 包下，组件扫描会扫到本包；
 * 网关的启动类在 com.aimcc.blog.gateway，只扫自己的子包，不会加载这个 WebMVC 的 Advice。
 *
 * 为什么网关不会因为本类依赖 Spring MVC 而报「WebMVC 与 WebFlux 冲突」：
 * 本模块对 spring-webmvc 用的是 provided 作用域，依赖不传递给下游，网关的 classpath 里没有它。
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** 业务异常：按业务码原样返回 */
    @ExceptionHandler(BizException.class)
    public ApiResult<Void> handleBiz(BizException e) {
        log.warn("业务异常: {}", e.getMessage());
        return ApiResult.fail(e.getCode(), e.getMessage());
    }

    /** 未登录：401（Sa-Token 拦截器抛出；public 没有鉴权，永远不会走到这里） */
    @ExceptionHandler(NotLoginException.class)
    public ApiResult<Void> handleNotLogin(NotLoginException e) {
        log.warn("未登录访问: {}", e.getMessage());
        return ApiResult.fail(ErrorCode.UNAUTHORIZED);
    }

    /** 请求体格式不对（比如该发 JSON 却发了表单）：415 */
    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ApiResult<Void> handleMediaType(HttpMediaTypeNotSupportedException e) {
        log.warn("请求格式不支持: {}", e.getMessage());
        return ApiResult.fail(ErrorCode.UNSUPPORTED_MEDIA_TYPE);
    }

    /** 请求方式不对（比如 GET 打了 POST 接口）：405 */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ApiResult<Void> handleMethod(HttpRequestMethodNotSupportedException e) {
        log.warn("请求方式不支持: {}", e.getMessage());
        return ApiResult.fail(ErrorCode.METHOD_NOT_ALLOWED);
    }

    /** 参数类型不对（比如 sort 传了枚举里没有的值）：400 */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ApiResult<Void> handleTypeMismatch(MethodArgumentTypeMismatchException e) {
        String name = e.getName();                    // 出错的参数名，如 "sort"
        Class<?> requiredType = e.getRequiredType();  // 目标类型，如 ArticleSort.class
        // 目标类型是枚举时，把可选值一并告诉前端，省得对方翻文档
        if (requiredType != null && requiredType.isEnum()) {
            List<String> names = new ArrayList<>();
            for (Object value : requiredType.getEnumConstants()) {
                names.add(((Enum<?>) value).name());
            }
            log.warn("参数类型不匹配: {} = {}", name, e.getValue());
            return ApiResult.fail(ErrorCode.BAD_REQUEST, name + " 取值不合法，可选值：" + String.join("、", names));
        }
        log.warn("参数类型不匹配: {}", name);
        return ApiResult.fail(ErrorCode.BAD_REQUEST, name + " 参数格式不对");
    }

    /** 路径未找到：404 */
    @ExceptionHandler(NoResourceFoundException.class)
    public ApiResult<Void> handleNoHandlerFound(NoResourceFoundException e) {
        log.warn("路径未找到: {}", e.getMessage());
        return ApiResult.fail(ErrorCode.NOT_FOUND, "路径未找到");
    }

    /** 兜底：没料到的异常一律 500，不给前端看堆栈 */
    @ExceptionHandler(Exception.class)
    public ApiResult<Void> handleOther(Exception e) {
        log.error("系统异常", e);   // 第二个参数传异常对象，完整堆栈进日志
        return ApiResult.fail(ErrorCode.INTERNAL_ERROR);
    }
}
