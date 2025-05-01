package com.filesharing.controller;

import com.filesharing.dto.FileAccessDto;
import com.filesharing.dto.FileDto;
import com.filesharing.dto.FileUploadResponseDto;
import com.filesharing.model.AccessLog;
import com.filesharing.model.FileMetadata;
import com.filesharing.service.FileService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @PostMapping("/upload")
    public ResponseEntity<FileUploadResponseDto> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "accessLevel", defaultValue = "PRIVATE") FileMetadata.AccessLevel accessLevel) throws IOException {
        return ResponseEntity.ok(fileService.uploadFile(file, accessLevel));
    }

    @GetMapping
    public ResponseEntity<List<FileDto>> getUserFiles() {
        return ResponseEntity.ok(fileService.getUserFiles());
    }

    @GetMapping("/shared")
    public ResponseEntity<List<FileDto>> getSharedWithMeFiles() {
        return ResponseEntity.ok(fileService.getSharedWithMeFiles());
    }

    @GetMapping("/public")
    public ResponseEntity<List<FileDto>> getPublicFiles() {
        return ResponseEntity.ok(fileService.getPublicFiles());
    }

    @GetMapping("/{fileId}/download")
    public ResponseEntity<String> getFileDownloadUrl(@PathVariable UUID fileId, HttpServletRequest request) {
        return ResponseEntity.ok(fileService.getFileDownloadUrl(fileId, request));
    }

    @DeleteMapping("/{fileId}")
    public ResponseEntity<Void> deleteFile(@PathVariable UUID fileId) {
        fileService.deleteFile(fileId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{fileId}/access")
    public ResponseEntity<Void> updateFileAccess(
            @PathVariable UUID fileId,
            @RequestParam FileMetadata.AccessLevel accessLevel) {
        fileService.updateFileAccess(fileId, accessLevel);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{fileId}/share")
    public ResponseEntity<Void> shareFile(
            @PathVariable UUID fileId,
            @RequestParam UUID userId,
            @RequestParam(defaultValue = "true") boolean canView,
            @RequestParam(defaultValue = "false") boolean canEdit,
            @RequestParam(defaultValue = "false") boolean canUpload) {
        fileService.shareFile(fileId, userId, canView, canEdit, canUpload);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{fileId}/share/{userId}")
    public ResponseEntity<Void> removeFileAccess(
            @PathVariable UUID fileId,
            @PathVariable UUID userId) {
        fileService.removeFileAccess(fileId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{fileId}/access")
    public ResponseEntity<List<FileAccessDto>> getFileAccessList(@PathVariable UUID fileId) {
        return ResponseEntity.ok(fileService.getFileAccessList(fileId));
    }

    @GetMapping("/{fileId}/logs")
    public ResponseEntity<List<AccessLog>> getFileAccessLogs(@PathVariable UUID fileId) {
        return ResponseEntity.ok(fileService.getFileAccessLogs(fileId));
    }
}
