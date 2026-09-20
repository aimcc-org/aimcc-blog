package com.aimcc.blog.exception;

import com.aimcc.blog.common.ApiResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 全局异常处理器：全项目 Controller 抛出的异常，都在这里统一翻译成 ApiResult
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

    /** 兜底：没料到的异常一律 500，不给前端看堆栈 */
    @ExceptionHandler(Exception.class)
    public ApiResult<Void> handleOther(Exception e) {
        log.error("系统异常", e);   // 第二个参数传异常对象，完整堆栈进日志
        return ApiResult.fail(500, "系统繁忙，请稍后再试");
    }
}
