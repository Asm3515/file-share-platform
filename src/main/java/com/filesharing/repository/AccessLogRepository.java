package com.filesharing.repository;

import com.filesharing.model.AccessLog;
import com.filesharing.model.FileMetadata;
import com.filesharing.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AccessLogRepository extends JpaRepository<AccessLog, UUID> {
    List<AccessLog> findByFile(FileMetadata file);
    List<AccessLog> findByUser(User user);
    List<AccessLog> findByFileAndUser(FileMetadata file, User user);
}
