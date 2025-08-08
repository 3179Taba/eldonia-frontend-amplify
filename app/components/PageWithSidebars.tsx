'use client'

import { ReactNode, useState } from 'react'
import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'

interface PageWithSidebarsProps {
  children: ReactNode;
  showRightSidebar?: boolean;
}

export default function PageWithSidebars({ children, showRightSidebar = true }: PageWithSidebarsProps) {
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-fantasy-gradient relative overflow-hidden">
      {/* メインコンテンツの背景をページ全体に広げる */}
      <div className="absolute inset-0 bg-gray-900"></div>
      {/* 左サイドバー - PC版のみ表示 */}
      <div className="hidden lg:block">
        <LeftSidebar isOpen={isLeftSidebarOpen} onToggle={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)} />
      </div>
      
      {/* 右サイドバー - PC版のみ表示 */}
      {showRightSidebar && (
        <div className="hidden lg:block">
          <RightSidebar isOpen={isRightSidebarOpen} onToggle={() => setIsRightSidebarOpen(!isRightSidebarOpen)} />
        </div>
      )}
      
      {/* メインコンテンツエリア - サイドバーの状態に応じてマージンを調整 */}
      <div className={`pt-20 transition-all duration-300 ${
        isLeftSidebarOpen && showRightSidebar && isRightSidebarOpen ? 'lg:ml-64 lg:mr-64' :
        isLeftSidebarOpen ? (showRightSidebar ? 'lg:ml-64 lg:mr-16' : 'lg:ml-64 lg:mr-0') :
        showRightSidebar && isRightSidebarOpen ? 'lg:ml-16 lg:mr-64' :
        (showRightSidebar ? 'lg:ml-16 lg:mr-16' : 'lg:ml-16 lg:mr-0')
      }`}>
        {children}
      </div>
    </div>
  )
} 